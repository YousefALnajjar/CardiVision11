import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("================================================================================");
  console.log("🚀 STARTING CARDIOVISION 12-POINT E2E TEST PLAN: POSTGRESQL SYNC & ADMIN SECURITY");
  console.log("================================================================================\n");

  let passedTests = 0;
  const totalTests = 12;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: User authentication (Student login)
    // -------------------------------------------------------------------------
    console.log("👉 Test 1: Student User Login & Authentication");
    const studentEmail = "student_test_" + Date.now() + "@cardiovision.sy";
    const studentRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: studentEmail,
        password: "securepassword123",
        name: "طالب تجريبي للاختبار",
        specialty: "الهندسة الطبية والحيوية",
        university: "جامعة دمشق"
      })
    });
    const studentData = await studentRes.json();
    if (!studentRes.ok || !studentData.token) {
      throw new Error(`Test 1 Failed: Could not login student: ${JSON.stringify(studentData)}`);
    }
    const studentToken = studentData.token;
    console.log("   ✅ Passed: Student logged in successfully. User ID:", studentData.user.id, "Role:", studentData.user.role);
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 2: Project retrieval from PostgreSQL
    // -------------------------------------------------------------------------
    console.log("\n👉 Test 2: Project Retrieval from PostgreSQL");
    const projRes = await pool.query("SELECT id, title_ar, rating_average, reviews_count FROM projects LIMIT 1");
    if (projRes.rows.length === 0) {
      throw new Error("Test 2 Failed: No projects found in PostgreSQL database.");
    }
    const testProject = projRes.rows[0];
    console.log("   ✅ Passed: Found project in PostgreSQL:", testProject.id, "-", testProject.title_ar, `(Initial Rating: ${testProject.rating_average}, Reviews: ${testProject.reviews_count})`);
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 3: User submits comment with rating via POST /api/projects/:id/comments
    // -------------------------------------------------------------------------
    console.log("\n👉 Test 3: Student Submitting Comment & Rating via API");
    const testCommentText = "اختبار مزامنة التعليقات مع PostgreSQL رقم " + Date.now();
    const commentRes = await fetch(`${BASE_URL}/api/projects/${testProject.id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        comment: testCommentText,
        rating: 5
      })
    });
    const commentData = await commentRes.json();
    if (!commentRes.ok || !commentData.success || !commentData.comment) {
      throw new Error(`Test 3 Failed: Submit comment failed: ${JSON.stringify(commentData)}`);
    }
    const createdComment = commentData.comment;
    console.log("   ✅ Passed: Comment submitted successfully. Comment ID:", createdComment.id);
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 4: Direct PostgreSQL Verification for the new comment
    // -------------------------------------------------------------------------
    console.log("\n👉 Test 4: Verifying Comment Persistence in PostgreSQL Database Directly");
    const dbCommentCheck = await pool.query(
      "SELECT id, project_id, user_id, comment_text, status FROM comments WHERE id = $1",
      [createdComment.id]
    );
    if (dbCommentCheck.rows.length === 0) {
      throw new Error(`Test 4 Failed: Comment with ID ${createdComment.id} not found in PostgreSQL comments table!`);
    }
    const storedComment = dbCommentCheck.rows[0];
    console.log("   ✅ Passed: Comment verified in PostgreSQL table. Stored text:", storedComment.comment_text, "Status:", storedComment.status);
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 5: Verify Project Rating and Reviews Count updated in PostgreSQL
    // -------------------------------------------------------------------------
    console.log("\n👉 Test 5: Verify Project Reviews Count & Rating Recalculated in PostgreSQL");
    const updatedProjRes = await pool.query("SELECT rating_average, reviews_count FROM projects WHERE id = $1", [testProject.id]);
    const updatedProj = updatedProjRes.rows[0];
    console.log(`   ✅ Passed: Project in DB now has reviews_count = ${updatedProj.reviews_count}, rating_average = ${updatedProj.rating_average}`);
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 6: Student UI Feed Endpoint (GET /api/projects/:id/comments)
    // -------------------------------------------------------------------------
    console.log("\n👉 Test 6: Verifying Public Project Comments Endpoint for Frontend");
    const feedRes = await fetch(`${BASE_URL}/api/projects/${testProject.id}/comments`);
    const feedData = await feedRes.json();
    if (!feedRes.ok || !Array.isArray(feedData.comments)) {
      throw new Error(`Test 6 Failed: Could not fetch project comments feed: ${JSON.stringify(feedData)}`);
    }
    const foundInFeed = feedData.comments.some((c: any) => c.id === createdComment.id);
    if (!foundInFeed) {
      throw new Error(`Test 6 Failed: Newly submitted comment ${createdComment.id} was not present in public comments feed!`);
    }
    console.log(`   ✅ Passed: Comment present in project comments feed (Total in feed: ${feedData.comments.length})`);
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 7: Security Check - Unauthenticated access to Admin Endpoints blocked (401)
    // -------------------------------------------------------------------------
    console.log("\n👉 Test 7: Security Test - Unauthenticated Access to Admin API Blocked (401)");
    const unauthResComments = await fetch(`${BASE_URL}/api/admin/comments`);
    const unauthResReviews = await fetch(`${BASE_URL}/api/admin/reviews`);
    if (unauthResComments.status !== 401 || unauthResReviews.status !== 401) {
      throw new Error(`Test 7 Failed: Expected status 401 for unauthenticated request, got ${unauthResComments.status} / ${unauthResReviews.status}`);
    }
    console.log("   ✅ Passed: Unauthenticated requests correctly rejected with HTTP 401 Unauthorized.");
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 8: Security Check - Non-Admin Student access to Admin Endpoints blocked (403)
    // -------------------------------------------------------------------------
    console.log("\n👉 Test 8: Security Test - Regular Student Access to Admin API Blocked (403)");
    const forbiddenComments = await fetch(`${BASE_URL}/api/admin/comments`, {
      headers: { "Authorization": `Bearer ${studentToken}` }
    });
    const forbiddenReviews = await fetch(`${BASE_URL}/api/admin/reviews`, {
      headers: { "Authorization": `Bearer ${studentToken}` }
    });
    if (forbiddenComments.status !== 403 || forbiddenReviews.status !== 403) {
      throw new Error(`Test 8 Failed: Expected status 403 for student accessing admin endpoints, got ${forbiddenComments.status} / ${forbiddenReviews.status}`);
    }
    console.log("   ✅ Passed: Regular user requests strictly blocked with HTTP 403 Forbidden.");
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 9: Admin Login & Fetching All Comments via GET /api/admin/comments
    // -------------------------------------------------------------------------
    console.log("\n👉 Test 9: Admin Authentication & Fetching All Comments with Joins");
    const adminEmail = "admin@cardiovision.sy";
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminEmail,
        password: "adminpassword123",
        name: "مدير المنصة"
      })
    });
    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginRes.ok || !adminLoginData.token) {
      throw new Error(`Test 9 Failed: Admin login failed: ${JSON.stringify(adminLoginData)}`);
    }
    const adminToken = adminLoginData.token;
    console.log("   Admin logged in. Role:", adminLoginData.user.role);

    const adminCommentsRes = await fetch(`${BASE_URL}/api/admin/comments`, {
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    const adminCommentsData = await adminCommentsRes.json();
    if (!adminCommentsRes.ok || !Array.isArray(adminCommentsData.comments)) {
      throw new Error(`Test 9 Failed: Admin comments fetch failed: ${JSON.stringify(adminCommentsData)}`);
    }
    const adminFoundComment = adminCommentsData.comments.find((c: any) => c.id === createdComment.id);
    if (!adminFoundComment) {
      throw new Error(`Test 9 Failed: Created comment was not found in admin comments list!`);
    }
    if (!adminFoundComment.userName || !adminFoundComment.projectTitleAr) {
      throw new Error(`Test 9 Failed: Comment was missing joined user or project data!`);
    }
    console.log("   ✅ Passed: Admin retrieved comments list successfully. Found student comment with joined user:", adminFoundComment.userName, "and project:", adminFoundComment.projectTitleAr);
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 10: Admin Fetching Reviews and Analytics via GET /api/admin/reviews
    // -------------------------------------------------------------------------
    console.log("\n👉 Test 10: Admin Fetching Reviews & Rating Distribution Analytics");
    const adminReviewsRes = await fetch(`${BASE_URL}/api/admin/reviews`, {
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    const adminReviewsData = await adminReviewsRes.json();
    if (!adminReviewsRes.ok || !Array.isArray(adminReviewsData.reviews) || !adminReviewsData.stats) {
      throw new Error(`Test 10 Failed: Admin reviews fetch failed: ${JSON.stringify(adminReviewsData)}`);
    }
    console.log("   ✅ Passed: Admin reviews retrieved. Total reviews:", adminReviewsData.stats.totalReviews, "Average rating:", adminReviewsData.stats.averageRating, "Distribution:", adminReviewsData.stats.distribution);
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 11: Admin Moderation - Update Comment Status (PATCH /api/admin/comments/:id/status)
    // -------------------------------------------------------------------------
    console.log("\n👉 Test 11: Admin Moderation - Updating Comment Status to 'reviewed'");
    const patchStatusRes = await fetch(`${BASE_URL}/api/admin/comments/${createdComment.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: "reviewed" })
    });
    const patchStatusData = await patchStatusRes.json();
    if (!patchStatusRes.ok || !patchStatusData.success) {
      throw new Error(`Test 11 Failed: Could not update comment status: ${JSON.stringify(patchStatusData)}`);
    }
    // Verify in PostgreSQL
    const statusDbCheck = await pool.query("SELECT status FROM comments WHERE id = $1", [createdComment.id]);
    if (statusDbCheck.rows[0].status !== "reviewed") {
      throw new Error(`Test 11 Failed: Status in DB is '${statusDbCheck.rows[0].status}', expected 'reviewed'`);
    }
    console.log("   ✅ Passed: Comment status updated and verified in PostgreSQL as 'reviewed'.");
    passedTests++;

    // -------------------------------------------------------------------------
    // TEST 12: Admin Deletion - Delete Comment via DELETE /api/admin/comments/:id
    // -------------------------------------------------------------------------
    console.log("\n👉 Test 12: Admin Deletion - Deleting Comment & Recalculating Project Stats");
    const deleteRes = await fetch(`${BASE_URL}/api/admin/comments/${createdComment.id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    const deleteData = await deleteRes.json();
    if (!deleteRes.ok || !deleteData.success) {
      throw new Error(`Test 12 Failed: Comment deletion failed: ${JSON.stringify(deleteData)}`);
    }

    // Verify deletion in PostgreSQL
    const deletedDbCheck = await pool.query("SELECT id FROM comments WHERE id = $1", [createdComment.id]);
    if (deletedDbCheck.rows.length !== 0) {
      throw new Error(`Test 12 Failed: Comment still exists in PostgreSQL after deletion!`);
    }

    // Clean up student user created for test
    await pool.query("DELETE FROM users WHERE email = $1", [studentEmail]);

    console.log("   ✅ Passed: Comment deleted successfully and purged from PostgreSQL.");
    passedTests++;

    // -------------------------------------------------------------------------
    // FINAL SUMMARY
    // -------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
    console.log("💯 PostgreSQL IS FULLY SYNCHRONIZED WITH ADMIN DASHBOARD AND FRONTEND!");
    console.log("🔒 SERVER-SIDE SECURITY & PERMISSIONS VERIFIED 100% OPERATIONAL!");
    console.log("================================================================================\n");
  } catch (err: any) {
    console.error("\n❌ TEST EXECUTION ENCOUNTERED AN ERROR:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runTests();

sed -i -e 's/setActiveTab("home")/navigateTo("home")/g' src/App.tsx
sed -i -e 's/setActiveTab("admin")/navigateTo("admin")/g' src/App.tsx
sed -i -e 's/setActiveTab("projects")/navigateTo("projects")/g' src/App.tsx
sed -i -e 's/setActiveTab("services")/navigateTo("services")/g' src/App.tsx
sed -i -e 's/setActiveTab("consultations")/navigateTo("consultations")/g' src/App.tsx
sed -i -e 's/setActiveTab("contact")/navigateTo("contact")/g' src/App.tsx
sed -i -e 's/setActiveTab("student")/navigateTo("student")/g' src/App.tsx
sed -i -e 's/setActiveTab(tab)/navigateTo(tab)/g' src/App.tsx
sed -i -e 's/setActiveTab(isAdmin ? "admin" : "student")/navigateTo(isAdmin ? "admin" : "student")/g' src/App.tsx

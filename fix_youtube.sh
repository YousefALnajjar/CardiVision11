sed -i -e '/export default function ProjectDetailModal({/i \
const getYouTubeEmbedUrl = (url?: string) => {\
  if (!url) return "";\
  if (url.includes("/embed/")) return url;\
  const regExp = /^.*(youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|watch\\?v=|&v=)([^#&?]*).*/;\
  const match = url.match(regExp);\
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;\
};\
\
' src/components/ProjectDetailModal.tsx
sed -i -e 's/src={project.videoUrl}/src={getYouTubeEmbedUrl(project.videoUrl)}/g' src/components/ProjectDetailModal.tsx

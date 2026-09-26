sed -i -e '/const navigateTo = (tab: string, pathUrl?: string) => {/,+6c\
  const navigateTo = (tab: string, pathUrl?: string) => {\
    setActiveTab(tab);\
    if (pathUrl) {\
      window.history.pushState({}, "", pathUrl);\
    } else {\
      window.location.hash = tab;\
    }\
  };' src/App.tsx

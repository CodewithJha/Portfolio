import { lazy, PropsWithChildren, Suspense, useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import TechStackNew from "./TechStackNew";
import CallToAction from "./CallToAction";
import setSplitText from "./utils/splitText";

// TechStack with 3D balls - kept for later use
const TechStack = lazy(() => import("./TechStack"));
const SHOW_TECHSTACK_BALLS = false; // Set to true to re-enable 3D balls

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );

  useEffect(() => {
    const resizeHandler = () => {
      setSplitText();
      setIsDesktopView(window.innerWidth > 1024);
    };
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [isDesktopView]);

  return (
    <div className="container-main">
      <Cursor />
      <Navbar />
      <SocialIcons />
      {isDesktopView && children}
      <div className="container-main">
        <Landing>{!isDesktopView && children}</Landing>
        <About />
        <WhatIDo />
        <Career />
        <Work />
        {/* TechStack Section - Toggle SHOW_TECHSTACK_BALLS to enable/disable */}
        {SHOW_TECHSTACK_BALLS ? (
          <Suspense fallback={<div>Loading....</div>}>
            <TechStack />
          </Suspense>
        ) : (
          <TechStackNew />
        )}
        <CallToAction />
        <Contact />
      </div>
    </div>
  );
};

export default MainContainer;

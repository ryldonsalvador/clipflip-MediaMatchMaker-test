document.addEventListener("DOMContentLoaded", function () {
  // Initial position
  const initialX = 0;
  const initialY = 0;

  // Target position
  const targetX = 80;
  const targetY = 70;

  // Duration of the animation (in seconds)
  const duration = 1;
  const main = document.getElementById("container");
  let isDraggingEnabled = false; // Initially disabled until animation completes
  let isHandlePressTriggered = false; // Prevent handlePress from triggering multiple times
  let initialX2;
  let initialY2;
  let p; // Peel instance
  let introTween; // <-- global reference to kill the animation if needed
  // Select the hit areas
  const hitArea = document.querySelector(".dragArea");
  const hitArea2 = document.querySelector(".clickArea");

  // var p = new Peel("#top-left", {
  //   corner: Peel.Corners.TOP_LEFT,
  // });

  const video = document.getElementById("myVideo");
  const videoBehind = document.getElementById("myVideo-behind");
  const videoHotspot = document.querySelector(".video-hotspot");

  let animationPlayed = false;

  main.style.visibility = "visible";

  function initPeel() {
    const container = document.querySelector("#top-left");

    // Clean up previous peel instance DOM
    const existingPeel = container.querySelector(".peel");
    if (existingPeel) existingPeel.remove();

    // Reinitialize Peel.js
    p = new Peel("#top-left", {
      corner: Peel.Corners.TOP_LEFT,
    });

    // Re-run GSAP intro animation
    // playIntroAnimation();
  }

  initPeel();

  // Debounced re-init on window resize
  let resizeTimeout;
  let introVideo = true;
  window.addEventListener("resize", () => {
    if (introVideo) {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (introTween) {
          introTween.kill(); // Stop current animation
        }

        isDraggingEnabled = false;
        // Snap peel back to initial position instantly
        if (p) {
          p.setPeelPosition(initialX, initialY);
          hitArea.style.left = "0px";
          hitArea.style.top = "0px";
          hideInteractiveElements();
        }
        initPeel(); // Reinitialize and replay animation after reset
        animationPlayed = false;
        if (!animationPlayed && video.currentTime >= 5) {
          animationPlayed = true;
          playIntroAnimation(); //  call the named GSAP animation
        }
      }, 0);
    }
  });

  video.addEventListener("ended", function () {
    // console.log("Video has finished playing!");
    // You can trigger any action here
  });
  video.addEventListener("play", function () {
    // console.log("Video play triggered");
    // You can trigger any action here
  });

  video.addEventListener("timeupdate", function () {
    if (!animationPlayed && video.currentTime >= 4.5) {
      animationPlayed = true;
      playIntroAnimation(); //  call the named GSAP animation
    }
  });

  videoBehind.addEventListener("ended", function () {
    // console.log("Video has finished playing!");
    // You can trigger any action here
  });
  videoBehind.addEventListener("play", function () {
    // console.log("Video play triggered");
    // You can trigger any action here
  });

  videoBehind.addEventListener("timeupdate", function () {
    if (videoBehind.currentTime >= 15) {
      videoHotspot.style.display = "block";
    } else {
      videoHotspot.style.display = "none";
    }
  });
  videoHotspot.addEventListener("click", function () {
    console.log("hotspot clicked!");
    window.open(
      "https://app.clipflip.video/view/Odl0BedCxm1rBRabC7eF",
      "_blank"
    );
    videoBehind.pause();
  });
  // playIntroAnimation();

  function getResponsiveTarget() {
    const banner = document.querySelector(".container"); // or get it however you need
    const bannerWidth = banner.offsetWidth;
    const bannerHeight = banner.offsetHeight;

    // Calculate target positions relative to banner size
    const targetX = bannerWidth * 0.15; // 10% from left
    const targetY = bannerHeight * 0.15; // 10% from top

    return { targetX, targetY };
  }

  // GSAP animation intro
  function playIntroAnimation() {
    const { targetX, targetY } = getResponsiveTarget();

    introTween = gsap.to(
      { x: initialX, y: initialY },
      {
        x: targetX,
        y: targetY,
        duration: duration,
        ease: "power1.inOut",
        repeat: 2,
        yoyo: true,
        onUpdate: function () {
          const { x, y } = this.targets()[0];
          p.setPeelPosition(x, y);
        },
        onComplete: function () {
          p.setPeelPosition(targetX, targetY);
          isDraggingEnabled = true;
          initializeHandlers();
        },
      }
    );

    initialX2 = targetX; // Initialize variables to store x position
    initialY2 = targetY; // Initialize variables to store y position
  }

  // Function to initialize handleDrag and handlePress
  function initializeHandlers() {
    // show handle drag and click
    showInteractiveElements();
    // Handle drag functionality
    p.handleDrag(function (evt, x, y) {
      if (!isDraggingEnabled) {
        return; // Stop processing if dragging has been disabled
      }

      // Update the position of the hitArea based on the drag coordinates
      hitArea.style.left = `${x - 70}px`;
      hitArea.style.top = `${y - 50}px`;

      initialX2 = x; // Update initialX2 dynamically
      initialY2 = y; // Update initialY2 dynamically
      p.setPeelPosition(x, y); // Use x and y in the method
      // console.log(p.getAmountClipped());
      if (p.getAmountClipped() >= 0.2) {
        // animateSlide(splide.index);
        hideInteractiveElements();
        isDraggingEnabled = false;
        p.removeEvents();
        p.handleDrag = function () {}; // Overwrite the drag function to disable it

        gsap.to(
          { x: initialX2, y: initialY2 },
          {
            x: 1300,
            y: 400,
            duration: 1,
            ease: "power1.inOut",
            onUpdate: function () {
              const { x, y } = this.targets()[0];
              p.setPeelPosition(x, y); // Update the position during the animation
            },
            onComplete: function () {
              introVideo = false;
              p.setPeelPosition(1300, 400);
              // console.log("Drag animation completed!");
              videoBehind.play();
              gsap.set(
                ".peel-top, .peel-bottom-shadow, .peel-back, .peel-top-shadow",
                {
                  display: "none",
                }
              );
            },
          }
        );
      }
    }, hitArea);

    // Attach drag and click detection to both hit areas
    // Define onClick handlers for each hit area
    function onClickHitArea() {
      onClick(); // Call the shared onClick logic
    }

    function onClickHitArea2() {
      onClick(); // Call the shared onClick logic
    }

    // Reusable function for drag detection
    function addDragAndClickDetection(element, onClick) {
      let startX,
        startY,
        isDragging = false;
      const dragThreshold = 10; // Adjust this threshold as needed for drag detection

      // Add event listeners for both mouse and touch interactions
      element.addEventListener("mousedown", (event) =>
        handleStart(event.clientX, event.clientY)
      );
      element.addEventListener("touchstart", (event) => {
        const touch = event.touches[0];
        handleStart(touch.clientX, touch.clientY);
      });

      element.addEventListener("mousemove", (event) =>
        handleMove(event.clientX, event.clientY)
      );
      element.addEventListener("touchmove", (event) => {
        const touch = event.touches[0];
        handleMove(touch.clientX, touch.clientY);
      });

      element.addEventListener("mouseup", handleEnd);
      element.addEventListener("touchend", handleEnd);

      function handleStart(x, y) {
        isDragging = false; // Reset drag state
        startX = x; // Record the starting X position
        startY = y; // Record the starting Y position
      }

      function handleMove(x, y) {
        const deltaX = Math.abs(x - startX);
        const deltaY = Math.abs(y - startY);

        // Check if movement exceeds the drag threshold
        if (deltaX > dragThreshold || deltaY > dragThreshold) {
          isDragging = true; // Mark as dragging
        }
      }

      function handleEnd() {
        if (!isDragging) {
          // console.log(`${element.className} detected click`);
          onClick(); // Perform the desired click action
        } else {
          // console.log(`${element.className} detected drag`);
        }
      }
    }

    // Define the shared onClick logic
    function onClick() {
      videoBehind.play();
      hideInteractiveElements();
      if (isHandlePressTriggered) {
        return; // Exit if handlePress was already triggered
      }

      isHandlePressTriggered = true; // Set the flag to true to prevent re-triggering

      // Create the GSAP tween dynamically on press to use the updated x and y
      gsap.to(
        { x: initialX2, y: initialY2 }, // Use the latest values of initialX2 and initialY2
        {
          x: 1300,
          y: 400,
          duration: 1,
          ease: "power1.inOut",
          onUpdate: function () {
            const { x, y } = this.targets()[0];
            p.setPeelPosition(x, y); // Update the position during the animation
          },
          onComplete: function () {
            introVideo = false;
            p.setPeelPosition(1300, 400);
            // console.log("Press animation completed!");
            gsap.set(
              ".peel-top, .peel-bottom-shadow, .peel-back, .peel-top-shadow",
              {
                display: "none",
              }
            );

            // Reset the flag after the animation is completed
            isHandlePressTriggered = false;
          },
        }
      );
    }

    // Attach drag and click detection to both hit areas
    addDragAndClickDetection(hitArea, onClickHitArea);
    addDragAndClickDetection(hitArea2, onClickHitArea2);
  }

  // hide handle drag and click
  function hideInteractiveElements() {
    gsap.set(".dragArea, .clickArea", {
      display: "none",
    });
  }
  // show handle drag and click
  function showInteractiveElements() {
    gsap.set(".dragArea , .clickArea", {
      display: "block",
    });
  }
});

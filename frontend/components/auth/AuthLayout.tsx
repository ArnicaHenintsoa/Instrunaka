"use client";

import { useState, useEffect } from "react";

const IMAGES = [
  "/auth/login-1.jpg",
  "/auth/login-2.jpg",
  "/auth/login-6.jpg",
  "/auth/login-3.jpg",
];

const DURATION = 6000;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % IMAGES.length);
    }, DURATION);
    return () => clearInterval(interval);
  }, [currentImage]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#120a2e]">
     
      <div className="absolute inset-y-0 left-0 z-0 w-full lg:w-[62%]">
        {IMAGES.map((image, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={image}
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-in-out"
            style={{ opacity: index === currentImage ? 1 : 0 }}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-b from-[#120a2e]/70 via-[#120a2e]/25 to-[#120a2e]/65 lg:from-[#120a2e]/65 lg:via-transparent lg:to-[#120a2e]/60" />

      
        <div className="absolute left-12 top-10 z-10 hidden lg:block">
          <h1
            className="animate-stroke text-4xl font-extrabold tracking-tight drop-shadow-lg"
            style={{ WebkitTextStroke: "1px white", WebkitTextFillColor: "transparent" }}
          >
            Instrunaka
          </h1>
          <p className="mt-1 text-base text-white/90 drop-shadow">
            Le son malgache, sans limites.
          </p>
        </div>

      
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 lg:bottom-6 lg:left-12 lg:translate-x-0">
          {IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              aria-label={`Image ${index + 1}`}
              className="h-1 w-8 overflow-hidden rounded-full bg-white/30 sm:w-12"
            >
              <span
                className={`block h-full rounded-full bg-white ${
                  index === currentImage ? "w-full transition-[width] ease-linear" : "w-0"
                }`}
                style={index === currentImage ? { transitionDuration: `${DURATION}ms` } : undefined}
              />
            </button>
          ))}
        </div>
      </div>

    
      <div
        className="absolute inset-0 z-10 overflow-y-auto overscroll-contain
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                   lg:left-auto lg:right-0 lg:w-[46%] lg:rounded-l-[3rem]
                   lg:bg-gradient-to-r lg:from-white lg:from-60% lg:to-[#d9d0f0]
                   lg:dark:from-[#120a2e] lg:dark:from-60% lg:dark:to-[#1e1448]
                   lg:shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.45)]"
      >
      
        <div className="flex min-h-full flex-col items-center px-4 py-5 sm:px-8 lg:px-10 lg:py-10">
          <div className="my-auto flex w-full max-w-md flex-col items-center gap-3">
         
            <div className="text-center lg:hidden [@media(max-height:760px)]:hidden">
              <h1
                className="animate-stroke text-3xl font-extrabold tracking-tight drop-shadow-lg"
                style={{ WebkitTextStroke: "1px white", WebkitTextFillColor: "transparent" }}
              >
                Instrunaka
              </h1>
              <p className="mt-0.5 text-xs text-white/90 drop-shadow sm:text-sm">
                Le son malgache, sans limites.
              </p>
            </div>

            <div
              className="w-full
                         max-lg:rounded-[2rem] max-lg:border max-lg:border-white/40 max-lg:bg-white/90
                         max-lg:p-2 max-lg:shadow-2xl max-lg:shadow-black/40 max-lg:backdrop-blur-xl
                         sm:max-lg:p-4
                         max-lg:dark:border-white/10 max-lg:dark:bg-[#120a2e]/85 max-lg:dark:shadow-black/70"
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
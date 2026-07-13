// hooks/useScrollReveal.ts
"use client";
import { useEffect, useRef, useState } from "react";

export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([enteredElement]) => {
        if (enteredElement.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(enteredElement.target); // on observe qu'une fois
        }
      },
      { threshold: 0.2 } // se déclenche quand 20% de l'élément est visible
    );

    if (ref.current) 
    {
      observer.observe(ref.current);
    }

    return () => observer.disconnect(); //cleanup function
  }, []);

  return { ref, isVisible };
}
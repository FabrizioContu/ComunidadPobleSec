"use client";

import Simulator from "./Simulator";

export default function Hero() {
  return (
    <div className="rounded-md bg-white h-dvh">
      <div className="mx-auto max-w-full py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-balance text-gray-900 sm:text-4xl pb-16">
            Comunidad Energética de Poble Sec
          </h1>
        </div>
        <Simulator />
      </div>
    </div>
  );
}

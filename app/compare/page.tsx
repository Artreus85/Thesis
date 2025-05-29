"use client";

import { CarCard } from "@/components/car-card";
import { Car } from "@/lib/types";
import { useState } from "react";
import { set } from "zod";

export default function ComparePage({ car1, car2 }: { car1: Car, car2: Car }) {
    const [cardBackground, setCardBackground] = useState<string>("bg-white");
    const [fuelTypeIsDifferent, setfuelTypeIsDifferent] = useState<boolean>(false);

    
    if(car1.fuel !== car2.fuel) {
        setfuelTypeIsDifferent(true);
    }

    const assignBackground = () => {
        return fuelTypeIsDifferent ? "bg-red-100" : "bg-green-100";
    }

    setCardBackground(assignBackground());
    
    return (
        <>
            <div className={`container mx-auto px-4 py-8 ${cardBackground}`}>
                <h1 className="text-3xl font-bold mb-6">Сравни обяви</h1>

                <CarCard car={car1}/>
                <CarCard car={car2}/>
            </div>
        </>
    );
}

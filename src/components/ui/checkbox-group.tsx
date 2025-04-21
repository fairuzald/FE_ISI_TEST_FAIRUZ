"use client";

import { H5 } from "@/components/ui/typography";
import React from "react";
import { Checkbox } from "./checkbox";

export interface CheckboxOption {
  id: string | number;
  label: string;
  value: string;
}

export interface CheckboxGroupProps {
  title?: string;
  options: CheckboxOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function CheckboxGroup({
  title,
  options,
  selectedValues,
  onChange,
  className,
  orientation = "vertical",
}: CheckboxGroupProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      onChange([...selectedValues, value]);
    } else {
      onChange(selectedValues.filter((item) => item !== value));
    }
  };

  return (
    <div className={className}>
      {title && <H5 className="mb-2">{title}</H5>}
      <div
        className={`flex gap-4 flex-wrap ${
          orientation === "vertical" ? "flex-col" : "flex-row"
        }`}
      >
        {options.map((option) => (
          <Checkbox
            key={option.id}
            id={`checkbox-${option.id}`}
            value={option.value}
            label={option.label}
            checked={selectedValues.includes(option.value)}
            onChange={handleCheckboxChange}
          />
        ))}
      </div>
    </div>
  );
}

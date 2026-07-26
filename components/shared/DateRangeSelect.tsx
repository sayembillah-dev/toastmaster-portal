"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DATE_RANGE_PRESETS, DATE_RANGE_LABELS, type DateRangePreset } from "@/lib/dateRangeConstants";

type Props = {
  value: DateRangePreset;
  onChange: (value: DateRangePreset) => void;
};

export function DateRangeSelect({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => { if (v) onChange(v as DateRangePreset); }}>
      <SelectTrigger className="w-full sm:w-44">
        <SelectValue>{(v: DateRangePreset) => DATE_RANGE_LABELS[v]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {DATE_RANGE_PRESETS.map((p) => (
          <SelectItem key={p} value={p}>
            {DATE_RANGE_LABELS[p]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

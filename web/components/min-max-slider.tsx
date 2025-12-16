import { Slider } from "@/components/ui/slider";
import { BlockStack, FormLayout, InlineStack, Text, TextField } from "@shopify/polaris";

export interface MinMaxSliderProps {
  label: string;
  min: number;
  max: number;
  range: [number, number];
  onChange: (range: [number, number]) => void;
  step?: number;
  suffix?: string | { singular: string; plural: string };
  minError?: string;
  maxError?: string;
}

export function MinMaxSlider({
  label,
  min,
  max,
  range,
  onChange,
  step,
  suffix,
  minError,
  maxError,
}: MinMaxSliderProps) {
  const getSuffix = (value: number) =>
    typeof suffix === "string" ? suffix : value === 1 ? suffix?.singular : suffix?.plural;

  return (
    <BlockStack gap="150">
      <FormLayout.Group condensed>
        <InlineStack align="space-between" blockAlign="baseline">
          <TextField
            label="Min"
            type="number"
            labelHidden
            autoComplete="off"
            value={range[0].toString()}
            min={min}
            max={max}
            step={step ?? 1}
            prefix="Min:"
            suffix={getSuffix(range[0])}
            autoSize
            onChange={(value) => onChange([Number(value), range[1]])}
            error={minError}
          />
          <Text as="span" variant="bodyMd">
            {label}
          </Text>
          <TextField
            label="Min"
            type="number"
            labelHidden
            autoComplete="off"
            value={range[1].toString()}
            min={min}
            max={max}
            step={step ?? 1}
            prefix="Max:"
            suffix={getSuffix(range[1])}
            autoSize
            onChange={(value) => onChange([range[0], Number(value)])}
            error={maxError}
          />
        </InlineStack>
      </FormLayout.Group>
      <Slider value={range} onValueChange={onChange} min={min} max={max} step={step ?? 1} />
    </BlockStack>
  );
}

"use client";

import { useEffect, useState } from "react";

interface DynamicTextConfig {
  headline?: string;
  subheadline?: string;
  cta?: string;
  [key: string]: string | undefined;
}

function parseDynamicParams(): DynamicTextConfig {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const config: DynamicTextConfig = {};

  const headline = params.get("headline");
  if (headline) config.headline = headline;

  const sub = params.get("subheadline") || params.get("sub");
  if (sub) config.subheadline = sub;

  const cta = params.get("cta") || params.get("button");
  if (cta) config.cta = cta;

  params.forEach((val, key) => {
    if (key.startsWith("txt_") && val) {
      config[key.replace("txt_", "")] = val;
    }
  });

  return config;
}

export function useDynamicText(fallback: string, field: string): string {
  const [text, setText] = useState(fallback);

  useEffect(() => {
    const params = parseDynamicParams();
    if (params[field]) {
      setText(params[field]!);
      return;
    }

    const utm = new URLSearchParams(window.location.search).get("utm_content");
    if (utm && field === "headline") {
      setText(utm);
    }
  }, [field, fallback]);

  return text;
}

export function DynamicText({
  field,
  fallback,
  as: Tag = "span",
  className,
  children,
}: {
  field: string;
  fallback: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
}) {
  const text = useDynamicText(fallback, field);
  return <Tag className={className}>{text}{children}</Tag>;
}

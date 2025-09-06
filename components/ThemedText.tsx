import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 
    | "default" 
    | "title" 
    | "defaultSemiBold" 
    | "subtitle" 
    | "link"
    | "heading1"
    | "heading2"
    | "heading3"
    | "body"
    | "caption"
    | "overline"
    | "error"
    | "success"
    | "warning";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        type === "heading1" ? styles.heading1 : undefined,
        type === "heading2" ? styles.heading2 : undefined,
        type === "heading3" ? styles.heading3 : undefined,
        type === "body" ? styles.body : undefined,
        type === "caption" ? styles.caption : undefined,
        type === "overline" ? styles.overline : undefined,
        type === "error" ? styles.error : undefined,
        type === "success" ? styles.success : undefined,
        type === "warning" ? styles.warning : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
  heading1: {
    fontSize: 28,
    fontWeight: "bold",
    lineHeight: 36,
  },
  heading2: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 32,
  },
  heading3: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
  },
  overline: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  error: {
    fontSize: 16,
    lineHeight: 24,
    color: "#dc2626",
    fontWeight: "500",
  },
  success: {
    fontSize: 16,
    lineHeight: 24,
    color: "#16a34a",
    fontWeight: "500",
  },
  warning: {
    fontSize: 16,
    lineHeight: 24,
    color: "#ea580c",
    fontWeight: "500",
  },
});

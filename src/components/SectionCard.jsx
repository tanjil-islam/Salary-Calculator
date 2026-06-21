// src/components/SectionCard.jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, Chip } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../constants/colors";

export default function SectionCard({ title, badge, children }) {
  return (
    <Card style={styles.card}>
      {/* subtle glassy gradient */}
      <LinearGradient
        colors={["rgba(255,255,255,0.05)", "rgba(0,0,0,0.0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* floating header pill */}
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {badge ? (
            <Chip compact style={styles.badge} textStyle={styles.badgeText}>
              {badge}
            </Chip>
          ) : null}
        </View>
      </View>

      <View style={styles.inner}>{children}</View>

      {/* soft bottom shine */}
      <View style={styles.shine} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.cardEdge,
    elevation: 0,
  },
  inner: {
    padding: 18,
    paddingTop: 22, // a little extra because of floating header
  },

  headerWrap: {
    position: "absolute",
    top: -14,
    alignSelf: "center",
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.pillBg,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  title: {
    color: Colors.text,
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  badge: {
    backgroundColor: Colors.accent,
    borderRadius: 999,
  },
  badgeText: {
    color: "#1B1B1B",
    fontWeight: "800",
    fontSize: 11,
  },

  shine: {
    position: "absolute",
    bottom: -40,
    left: -40,
    right: -40,
    height: 80,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 999,
    transform: [{ rotate: "-3deg" }],
  },
});

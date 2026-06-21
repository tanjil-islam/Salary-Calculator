// src/components/QuestionSlider.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { Colors } from "../constants/colors";

export default function QuestionSlider({
  question,
  valueLabel,
  min,
  max,
  step,
  value,
  onChange,
  footer,
  onPressEdit,
}) {
  return (
    <View style={styles.wrap}>
      {/* question text */}
      <Text style={styles.question}>{question}</Text>

      {/* current value pill + pencil */}
      <View style={styles.rowBetween}>
        <View style={styles.valuePill}>
          <Text style={styles.valueText}>{valueLabel}</Text>
        </View>

        <IconButton
          icon="pencil-outline"
          iconColor="rgba(235,238,255,0.9)"
          size={18}
          onPress={onPressEdit}
          style={styles.iconBtn}
        />
      </View>

      {/* slider */}
      <Slider
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={Colors.accent}
        maximumTrackTintColor="rgba(249,250,251,0.18)"
        thumbTintColor={Colors.accent}
      />

      {/* optional footer */}
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 6,
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  question: {
    color: Colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    letterSpacing: 0.2,
  },

  valuePill: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: Colors.pillBg,
    borderWidth: 1,
    borderColor: Colors.cardEdge,
  },
  valueText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  iconBtn: {
    margin: 0,
  },

  footer: {
    color: Colors.muted2,
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});

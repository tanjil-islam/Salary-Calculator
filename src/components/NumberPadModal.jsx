import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Modal, Portal, Text, Button } from "react-native-paper";
import { Colors } from "../constants/colors";

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function formatWithCommas(numStr) {
  // keep decimals if present
  const [intPart, decPart] = numStr.split(".");
  const cleanInt = (intPart || "").replace(/^0+(?=\d)/, "");
  const withCommas =
    cleanInt.length > 0
      ? cleanInt.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : "0";
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
}

export default function NumberPadModal({
  visible,
  title = "Edit",
  prefix = "",
  suffix = "",
  initialValue = 0,
  allowDecimal = false,
  decimalsLimit = 2,
  min = 0,
  max = 1000000,
  onClose,
  onSave,
}) {
  const [raw, setRaw] = React.useState("0");

  React.useEffect(() => {
    const v = Number(initialValue) || 0;
    const s = allowDecimal ? String(v) : String(Math.round(v));
    setRaw(s);
  }, [initialValue, allowDecimal, visible]);

  const canAddDot = allowDecimal && !raw.includes(".");

  const push = (key) => {
    setRaw((prev) => {
      let next = prev;

      if (key === ".") {
        if (!canAddDot) return prev;
        return prev + ".";
      }

      // digits
      if (prev === "0") next = key; // replace leading 0
      else next = prev + key;

      // decimal precision limit
      if (allowDecimal && next.includes(".")) {
        const [a, b = ""] = next.split(".");
        if (b.length > decimalsLimit) return prev;
        // avoid empty integer part
        if (a.length === 0) next = "0." + b;
      }

      return next;
    });
  };

  const backspace = () => {
    setRaw((prev) => {
      if (prev.length <= 1) return "0";
      const next = prev.slice(0, -1);
      if (next === "-" || next === "" || next === "0.") return "0";
      return next;
    });
  };

  const toNumber = () => {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return 0;
    const clamped = clamp(parsed, min, max);
    return allowDecimal ? clamped : Math.round(clamped);
  };

  const displayValue = () => {
    // For salary: commas look premium
    const cleaned = raw === "" ? "0" : raw;
    if (allowDecimal) return cleaned; // decimals: show raw (more predictable)
    return formatWithCommas(cleaned.replace(/\D/g, "") || "0");
  };

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [allowDecimal ? "." : " ", "0", "⌫"],
  ];

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        {/* drag indicator */}
        <View style={styles.grabber} />

        <View style={styles.header}>
          <Text style={styles.bigValue}>
            {prefix}
            {displayValue()}
            {suffix}
          </Text>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.keypad}>
          {keys.map((row, rIdx) => (
            <View key={rIdx} style={styles.row}>
              {row.map((k) => {
                if (k === " ") {
                  return <View key="spacer" style={styles.keySpacer} />;
                }

                const isBack = k === "⌫";
                return (
                  <Pressable
                    key={k}
                    onPress={() => {
                      if (isBack) backspace();
                      else push(k);
                    }}
                    style={({ pressed }) => [
                      styles.key,
                      pressed && styles.keyPressed,
                    ]}
                  >
                    <Text style={styles.keyText}>{k}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <Button
          mode="contained"
          style={styles.saveBtn}
          contentStyle={{ paddingVertical: 10 }}
          labelStyle={{ fontSize: 18, fontWeight: "900" }}
          onPress={() => {
            const finalValue = toNumber();
            onSave(finalValue);
            onClose();
          }}
        >
          Save
        </Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardEdge,
  },
  grabber: {
    alignSelf: "center",
    width: 56,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
    marginBottom: 10,
  },
  header: { alignItems: "center", paddingVertical: 10 },
  bigValue: { color: Colors.text, fontSize: 44, fontWeight: "900" },
  title: { color: Colors.muted, marginTop: 6, fontSize: 14, fontWeight: "700" },

  keypad: { marginTop: 10, gap: 14 },
  row: { flexDirection: "row", justifyContent: "space-between" },

  key: {
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  keyPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: "rgba(0,0,0,0.26)",
  },
  keyText: { color: Colors.text, fontSize: 28, fontWeight: "900" },

  keySpacer: { width: 96, height: 96 },

  saveBtn: {
    marginTop: 18,
    borderRadius: 999,
    backgroundColor: Colors.accent,
  },
});

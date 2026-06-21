import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  Alert,
} from "react-native";
import {
  Text,
  Button,
  Card,
  SegmentedButtons,
  TextInput,
  IconButton,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Audio } from 'expo-av'; // 🔹 Added for sound
import * as Haptics from 'expo-haptics'; // 🔹 Added for vibration

import { Colors } from "../src/constants/colors";
import { currencyUSD } from "../src/logic/salary";
import {
  addHistoryEntry,
  deleteHistoryEntry,
} from "../src/storage/history";

// breakdown from yearly + hours per week (for hourly line)
function breakdownFromYearly(yearly, hpw) {
  const y = Number(yearly) || 0;
  const hoursPerWeek = Number(hpw) || 40;
  const totalHours = hoursPerWeek * 52;

  return {
    yearly: y,
    monthly: y / 12,
    biWeekly: y / 26,
    weekly: y / 52,
    daily: y / 260, // approx 5 days/week
    hourly: totalHours > 0 ? y / totalHours : 0,
  };
}

// compute yearly from salaryValue + period + hpw
function computeGrossYearly(baseValue, period, hpw) {
  const base = Number(baseValue) || 0;
  const hoursPerWeek = Number(hpw) || 40;

  switch (period) {
    case "Yearly":
      return base;
    case "Monthly":
      return base * 12;
    case "Biweekly":
    case "Bi-Weekly":
      return base * 26;
    case "Weekly":
      return base * 52;
    case "Daily":
      return base * 260; // 5 days * 52 weeks
    case "Hourly":
      return base * hoursPerWeek * 52;
    default:
      return base;
  }
}

export default function SalaryResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    baseValue,
    period,
    hpw,
    taxRate,
    label: paramLabel,
    id,
  } = params;

  const [mode, setMode] = React.useState("gross"); // "gross" | "net"
  const [label, setLabel] = React.useState(paramLabel || "");

  const isFromHistory = !!id;
  const hpwNum = Number(hpw) || 40;

  const grossYearly = computeGrossYearly(baseValue, period, hpwNum);

  // clamp tax between 0–100
  const t = Math.min(Math.max(Number(taxRate) || 0, 0), 100);
  const netYearly = grossYearly * (1 - t / 100);

  const grossAmounts = breakdownFromYearly(grossYearly, hpwNum);
  const netAmounts = breakdownFromYearly(netYearly, hpwNum);
  const amounts = mode === "gross" ? grossAmounts : netAmounts;

  const title = isFromHistory ? label || "Saved Salary" : "Salary Results";

  // 🔹 Sound Logic: Set mode so it works on silent/vibrate
  React.useEffect(() => {
    async function setupAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
        });
      } catch (e) {
        console.log(e);
      }
    }
    setupAudio();
  }, []);

  // 🔹 Sound Logic: Play the unique effect
  const playSaveSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/calculate-ping.mp3"), // Using your existing asset
        { shouldPlay: true, volume: 0.6 }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (e) {
      console.log("Sound error:", e);
    }
  };

  // Save as new history entry
  const handleSave = async () => {
    if (!label.trim()) {
      return;
    }

    try {
      // 🔹 TRIGGER VIBRATION & SOUND
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await playSaveSound();

      await addHistoryEntry({
        label: label.trim(),
        baseValue: Number(baseValue) || 0,
        period,
        hpw: hpwNum,
        taxRate: t,
        grossYearly,
        netYearly,
      });

      router.replace("/(tabs)/saved");
    } catch (e) {
      console.error("Save error", e);
    }
  };

  // Delete existing history entry (only when opened from Saved list)
  const handleDelete = () => {
    if (!id) return;

    Alert.alert(
      "Delete saved salary?",
      "This will remove this saved result from your history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteHistoryEntry(id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Button
            mode="text"
            onPress={() => router.back()}
            labelStyle={styles.backIconLabel}
            contentStyle={{ paddingHorizontal: 0 }}
          >
            {"<"}
          </Button>

          <Text style={styles.headerTitle}>{title}</Text>

          {isFromHistory ? (
            <IconButton
              icon="delete"
              iconColor="#F97373"
              size={24}
              onPress={handleDelete}
            />
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Segmented control: Gross / Net */}
        <Card style={styles.segmentCard}>
          <SegmentedButtons
            value={mode}
            onValueChange={(val) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Light tap on switch
              setMode(val);
            }}
            style={{ backgroundColor: "transparent" }}
            buttons={[
              {
                value: "gross",
                label: "Gross Income",
                style: styles.segmentButton,
                labelStyle: styles.segmentLabel,
              },
              {
                value: "net",
                label: "Net Income",
                style: styles.segmentButton,
                labelStyle: styles.segmentLabel,
              },
            ]}
          />
          <View style={styles.netBadgeWrap}>
            <View style={styles.netBadge}>
              <Text style={styles.netBadgeText}>New</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.subtitle}>
          {mode === "gross"
            ? "Your Income Before Taxes"
            : "Your Income After Taxes"}
        </Text>

        {/* Amount cards */}
        <AmountRow label="Annually" value={amounts.yearly} />
        <AmountRow label="Monthly" value={amounts.monthly} />
        <AmountRow label="Bi-Weekly" value={amounts.biWeekly} />
        <AmountRow label="Weekly" value={amounts.weekly} />
        <AmountRow label="Daily" value={amounts.daily} />
        <AmountRow label="Hourly" value={amounts.hourly} />

        {/* Name + Save (only when coming from Calculate, not from Saved list) */}
        {!isFromHistory && (
          <View style={{ marginTop: 22, gap: 14 }}>
            <TextInput
              mode="outlined"
              label="Name to save as"
              placeholder="e.g. Anika, Offer A, Main Job"
              value={label}
              onChangeText={setLabel}
              outlineColor="rgba(148,163,184,0.4)"
              activeOutlineColor={Colors.accent}
              textColor={Colors.text}
              style={{ backgroundColor: Colors.card }}
            />

            <View style={styles.bottomRow}>
              {/* BACK BUTTON */}
              <Button
                mode="outlined"
                onPress={() => router.back()}
                style={[styles.baseActionBtn, styles.backBtnOutline]}
                contentStyle={styles.actionBtnContent}
                labelStyle={styles.backBtnLabel}
              >
                Back
              </Button>

              {/* SAVE BUTTON */}
              <Button
                mode="contained"
                onPress={handleSave}
                style={[styles.baseActionBtn, styles.saveBtn]}
                contentStyle={styles.actionBtnContent}
                labelStyle={styles.saveBtnLabel}
              >
                Save
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AmountRow({ label, value }) {
  return (
    <Card style={styles.amountCard}>
      <View style={styles.amountInner}>
        <Text style={styles.amountLabel}>{label}</Text>
        <Text style={styles.amountValue}>{currencyUSD(value)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 32,
    paddingBottom: 32,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backIconLabel: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: "700",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: Colors.text,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  segmentCard: {
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardEdge,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 18,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  netBadgeWrap: {
    position: "absolute",
    right: 18,
    top: -10,
  },
  netBadge: {
    borderRadius: 999,
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  netBadgeText: {
    color: "#1B1B1B",
    fontSize: 11,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 18,
    textAlign: "center",
    color: Colors.muted2,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  amountCard: {
    backgroundColor: Colors.card,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: Colors.cardEdge,
  },
  amountInner: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  amountLabel: {
    color: Colors.muted2,
    fontSize: 14,
    marginBottom: 4,
  },
  amountValue: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: "900",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  baseActionBtn: {
    flex: 1,
    borderRadius: 16,
  },
  actionBtnContent: {
    paddingVertical: 12,
  },
  backBtnOutline: {
    borderColor: "rgba(148,163,184,0.3)",
    borderWidth: 1,
  },
  backBtnLabel: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
  },
  saveBtnLabel: {
    color: "#1B1B1B",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
});
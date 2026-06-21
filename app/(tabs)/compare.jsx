import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Card,
  SegmentedButtons,
  ActivityIndicator,
  Portal,
  Dialog,
  RadioButton,
  Button,
} from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from 'expo-haptics'; // 🔹 Added for vibration

import { Colors } from "../../src/constants/colors";
import { getHistory } from "../../src/storage/history";
import { currencyUSD } from "../../src/logic/salary";

// breakdown from yearly + hours per week (for hourly)
function breakdownFromYearly(yearly, hpw) {
  const y = Number(yearly) || 0;
  const hoursPerWeek = Number(hpw) || 40;
  const totalHours = hoursPerWeek * 52;

  return {
    annually: y,
    monthly: y / 12,
    biWeekly: y / 26,
    weekly: y / 52,
    daily: y / 260, // ~5 days * 52 weeks
    hourly: totalHours > 0 ? y / totalHours : 0,
  };
}

const LABELS = {
  annually: "Annually",
  monthly: "Monthly",
  biWeekly: "Bi-Weekly",
  weekly: "Weekly",
  daily: "Daily",
  hourly: "Hourly",
};

export default function CompareScreen() {
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [firstId, setFirstId] = React.useState(null);
  const [secondId, setSecondId] = React.useState(null);

  const [grossOrNet, setGrossOrNet] = React.useState("gross"); // 'gross' | 'net'
  const [diffMode, setDiffMode] = React.useState("currency"); // 'currency' | 'percent'

  // selector dialog state
  const [selectorVisible, setSelectorVisible] = React.useState(false);
  const [activeSelector, setActiveSelector] = React.useState(null); // 'first' | 'second'
  const [tempSelectedId, setTempSelectedId] = React.useState(null);

  // Load saved salaries when tab focused
  useFocusEffect(
    React.useCallback(() => {
      let active = true;

      const load = async () => {
        try {
          setLoading(true);
          const items = await getHistory();
          if (active) {
            setHistory(items);
            // auto-select first two if nothing chosen yet
            if (!firstId && items[0]) setFirstId(items[0].id);
            if (!secondId && items[1]) setSecondId(items[1].id);
          }
        } finally {
          if (active) setLoading(false);
        }
      };

      load();
      return () => {
        active = false;
      };
    }, [])
  );

  const first = history.find((h) => h.id === firstId) || null;
  const second = history.find((h) => h.id === secondId) || null;

  // Build breakdowns for selected salaries
  const firstBreakdown = React.useMemo(() => {
    if (!first) return null;
    const baseYearly =
      grossOrNet === "gross" ? first.grossYearly : first.netYearly;
    return breakdownFromYearly(baseYearly, first.hpw);
  }, [first, grossOrNet]);

  const secondBreakdown = React.useMemo(() => {
    if (!second) return null;
    const baseYearly =
      grossOrNet === "gross" ? second.grossYearly : second.netYearly;
    return breakdownFromYearly(baseYearly, second.hpw);
  }, [second, grossOrNet]);

  const canCompare = firstBreakdown && secondBreakdown;

  const buildDiffLabel = (key) => {
    if (!canCompare) return null;

    const a = firstBreakdown[key];
    const b = secondBreakdown[key];
    const diff = b - a;

    if (diffMode === "percent") {
      if (!a || a === 0) return "–";
      const pct = (diff / a) * 100;
      const sign = pct > 0 ? "+" : "";
      return `${sign}${pct.toFixed(1)}%`;
    }

    // currency mode
    const sign = diff > 0 ? "+" : "";
    return `${sign}${currencyUSD(diff)}`;
  };

  const titleFirst = first?.label || "Sample Salary";
  const titleSecond = second?.label || "Sample Salary";

  // open selector dialog for first/second
  const openSelector = (which) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // 🔹 Vibration on open
    setActiveSelector(which);
    if (which === "first") {
      setTempSelectedId(firstId || history[0]?.id || null);
    } else {
      setTempSelectedId(secondId || history[1]?.id || history[0]?.id || null);
    }
    setSelectorVisible(true);
  };

  const applySelector = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // 🔹 Vibration on Apply
    if (!tempSelectedId) {
      setSelectorVisible(false);
      return;
    }
    if (activeSelector === "first") {
      setFirstId(tempSelectedId);
    } else if (activeSelector === "second") {
      setSecondId(tempSelectedId);
    }
    setSelectorVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Compare</Text>

        {/* Selector cards */}
        <View style={{ gap: 12, marginBottom: 18 }}>
          {/* First salary selector */}
          <Card style={styles.selectorCard}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openSelector("first")}
            >
              <View style={styles.selectorInner}>
                <Text style={styles.selectorText}>
                  {first ? first.label : "Select first salary"}
                </Text>
                <Text style={styles.selectorChevron}>▼</Text>
              </View>
            </TouchableOpacity>
          </Card>

          {/* Second salary selector */}
          <Card style={styles.selectorCard}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openSelector("second")}
            >
              <View style={styles.selectorInner}>
                <Text style={styles.selectorText}>
                  {second ? second.label : "Select second salary"}
                </Text>
                <Text style={styles.selectorChevron}>▼</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Helper subtitle */}
        <Text style={styles.subtitleCenter}>See which pays more 🤑</Text>

        {/* $ / % switch – CENTERED */}
        <View style={styles.amountModeRow}>
          <SegmentedButtons
            value={diffMode}
            onValueChange={(val) => {
                Haptics.selectionAsync(); // 🔹 Soft vibration for toggle
                setDiffMode(val);
            }}
            buttons={[
              {
                value: "currency",
                label: "$",
                style: styles.smallSegmentButton,
                labelStyle: styles.smallSegmentLabel,
              },
              {
                value: "percent",
                label: "%",
                style: styles.smallSegmentButton,
                labelStyle: styles.smallSegmentLabel,
              },
            ]}
            style={styles.smallSegmentContainer}
          />
        </View>

        {/* Gross / Net */}
        <Card style={styles.segmentCard}>
          <SegmentedButtons
            value={grossOrNet}
            onValueChange={(val) => {
                Haptics.selectionAsync(); // 🔹 Soft vibration for toggle
                setGrossOrNet(val);
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
          <View style={styles.newBadgeWrap}>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          </View>
        </Card>

        {/* Headings over columns */}
        <View style={styles.columnsHeaderRow}>
          <Text style={styles.columnHeader}>{titleFirst}</Text>
          <Text style={styles.columnHeader}>{titleSecond}</Text>
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={Colors.accent} />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {Object.keys(LABELS).map((key) => {
              const diffLabel = buildDiffLabel(key);
              return (
                <View key={key} style={styles.rowWrap}>
                  {/* Left card: first salary */}
                  <Card style={styles.amountCardLeft}>
                    <View style={styles.amountInnerLeft}>
                      <Text style={styles.amountLabel}>{LABELS[key]}</Text>
                      <Text style={styles.amountValue}>
                        {firstBreakdown
                          ? currencyUSD(firstBreakdown[key])
                          : "$0.00"}
                      </Text>
                    </View>
                  </Card>

                  {/* Right card: second + diff INSIDE card */}
                  <Card style={styles.amountCardRight}>
                    <View style={styles.amountInnerRight}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.amountLabel}>{LABELS[key]}</Text>
                        <Text style={styles.amountValue}>
                          {secondBreakdown
                            ? currencyUSD(secondBreakdown[key])
                            : "$0.00"}
                        </Text>
                        {diffLabel && (
                          <Text style={styles.diffText}>
                            Difference:{" "}
                            <Text style={styles.diffHighlight}>{diffLabel}</Text>
                          </Text>
                        )}
                      </View>
                    </View>
                  </Card>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* 🔹 Selector dialog - Updated with previous centered style */}
      <Portal>
        <Dialog
          visible={selectorVisible}
          onDismiss={() => setSelectorVisible(false)}
          style={{ borderRadius: 24, backgroundColor: Colors.card }}
        >
          <Dialog.Title style={{ textAlign: 'center', fontWeight: '800' }}>
            {activeSelector === "first"
              ? "Select first salary"
              : "Select second salary"}
          </Dialog.Title>
          <Dialog.Content>
            {history.length === 0 ? (
              <Text style={{ textAlign: 'center', color: Colors.muted2 }}>No saved salaries yet.</Text>
            ) : (
              <RadioButton.Group
                onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // 🔹 Vibration on tap
                    setTempSelectedId(value);
                }}
                value={tempSelectedId}
              >
                <View style={{ alignItems: 'center' }}>
                    {history.map((item) => (
                    <View
                        key={item.id}
                        style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginVertical: 6,
                        width: '80%' // Ensure alignment is consistent
                        }}
                    >
                        <RadioButton value={item.id} color={Colors.accent} />
                        <View style={{ marginLeft: 8 }}>
                        <Text style={{ color: Colors.text, fontWeight: "700", fontSize: 16 }}>
                            {item.label || "(Unnamed)"}
                        </Text>
                        <Text style={{ color: Colors.muted2, fontSize: 12 }}>
                            {currencyUSD(item.grossYearly)} / yr
                        </Text>
                        </View>
                    </View>
                    ))}
                </View>
              </RadioButton.Group>
            )}
          </Dialog.Content>
          <Dialog.Actions style={{ justifyContent: 'center', gap: 20, paddingBottom: 16 }}>
            <Button textColor={Colors.muted} onPress={() => setSelectorVisible(false)}>Cancel</Button>
            <Button mode="contained" buttonColor={Colors.accent} textColor="#111" onPress={applySelector}>Apply</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
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
    gap: 12,
  },
  headerTitle: {
    textAlign: "center",
    color: Colors.text,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0.3,
    marginBottom: 18,
  },

  selectorCard: {
    borderRadius: 26,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardEdge,
  },
  selectorInner: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorText: {
    color: Colors.muted2,
    fontSize: 15,
  },
  selectorChevron: {
    color: Colors.muted2,
    fontSize: 16,
  },

  subtitleCenter: {
    marginTop: 6,
    marginBottom: 6,
    textAlign: "center",
    color: Colors.muted2,
    fontSize: 14,
  },

  // CENTERED TOGGLE
  amountModeRow: {
    alignItems: "center",      // center children horizontally
    marginBottom: 10,
  },
  smallSegmentContainer: {
    width: 140,                // a bit wider pill
    alignSelf: "center",       // center inside row
    backgroundColor: Colors.card,
    borderRadius: 999,
  },
  smallSegmentButton: {
    borderRadius: 999,
  },
  smallSegmentLabel: {
    fontSize: 13,
    fontWeight: "800",
  },

  segmentCard: {
    marginTop: 4,
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
  newBadgeWrap: {
    position: "absolute",
    right: 18,
    top: -10,
  },
  newBadge: {
    borderRadius: 999,
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  newBadgeText: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "800",
  },

  columnsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 4,
  },
  columnHeader: {
    width: "48%",
    color: Colors.text,
    fontSize: 15,
    fontWeight: "800",
  },

  loaderWrap: {
    marginTop: 32,
    alignItems: "center",
  },

  rowWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  amountCardLeft: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.cardEdge,
  },
  amountInnerLeft: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },

  amountCardRight: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.cardEdge,
  },
  amountInnerRight: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
  },

  amountLabel: {
    color: Colors.muted2,
    fontSize: 13,
    marginBottom: 2,
  },
  amountValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },

  diffText: {
    marginTop: 2,
    color: Colors.muted2,
    fontSize: 12,
  },
  diffHighlight: {
    color: "#22C55E", // green
    fontWeight: "800",
  },
});
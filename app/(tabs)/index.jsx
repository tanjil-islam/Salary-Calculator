import React from "react";
import { SafeAreaView, ScrollView, View, StyleSheet } from "react-native";
import {
  Button,
  Card,
  Divider,
  IconButton,
  Text,
  Dialog,
  Portal,
  RadioButton,
} from "react-native-paper";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Audio } from 'expo-av'; // 🔹 Added for sound
import * as Haptics from 'expo-haptics'; // 🔹 Added for vibration

import SectionCard from "../../src/components/SectionCard";
import QuestionSlider from "../../src/components/QuestionSlider";
import NumberPadModal from "../../src/components/NumberPadModal";

import { Colors } from "../../src/constants/colors";
import { useSalaryCalculator } from "../../src/hooks/useSalaryCalculator";
import { currencyUSD, round2 } from "../../src/logic/salary";

const periods = ["Hourly", "Weekly", "Biweekly", "Monthly", "Yearly"];

export default function HomeScreen() {
  const calc = useSalaryCalculator();
  const router = useRouter();

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
  const playCalculateSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/calculate-ping.mp3"), // Ensure file is here
        { shouldPlay: true, volume: 0.6 }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (e) {
      console.log("Sound error:", e);
    }
  };

  // Manual keypad modal state
  const [edit, setEdit] = React.useState({
    visible: false,
    key: null,
    title: "",
    prefix: "",
    suffix: "",
    allowDecimal: false,
    min: 0,
    max: 100,
  });

  // Period selector dialog state
  const [periodDialogVisible, setPeriodDialogVisible] = React.useState(false);

  const openEdit = (key, options) => {
    setEdit({
      visible: true,
      key,
      title: options.title || "",
      prefix: options.prefix || "",
      suffix: options.suffix || "",
      allowDecimal: !!options.allowDecimal,
      min: options.min ?? 0,
      max: options.max ?? 100,
    });
  };

  const closeEdit = () => setEdit((p) => ({ ...p, visible: false }));

  const getInitialValue = () => {
    switch (edit.key) {
      case "salary":
        return calc.salaryValue;
      case "hoursPerDay":
        return calc.hoursPerDay;
      case "daysPerWeek":
        return calc.daysPerWeek;
      case "otHours":
        return calc.otHoursPerWeek;
      case "otMultiplier":
        return calc.otMultiplier;
      case "taxRate":
        return calc.taxRate;
      default:
        return 0;
    }
  };

  const saveValue = (val) => {
    switch (edit.key) {
      case "salary":
        calc.setSalaryValue(val);
        break;
      case "hoursPerDay":
        calc.setHoursPerDay(val);
        break;
      case "daysPerWeek":
        calc.setDaysPerWeek(val);
        break;
      case "otHours":
        calc.setOtHoursPerWeek(val);
        break;
      case "otMultiplier":
        calc.setOtMultiplier(val);
        break;
      case "taxRate":
        calc.setTaxRate(val);
        break;
      default:
        break;
    }
  };

  const { hpw, overtimeHourly, netYearly } = calc.result;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Salary Card */}
        <Card style={styles.salaryCard}>
          <LinearGradient
            colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)", "rgba(0,0,0,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.salaryInner}>
            <View style={styles.salaryTopRow}>
              <Text style={styles.salaryLabel}>Your Salary</Text>

              <IconButton
                icon="pencil-outline"
                iconColor="rgba(232,234,247,0.85)"
                size={22}
                style={styles.pencilBtn}
                onPress={() =>
                  openEdit("salary", {
                    title: "Your Salary",
                    prefix: "$",
                    suffix: "",
                    allowDecimal: true,
                    min: 0,
                    max: 1000000,
                  })
                }
              />
            </View>

            <Text style={styles.salaryValue}>{currencyUSD(calc.salaryValue)}</Text>

            {/* Period selection button (opens dialog) */}
            <View style={styles.periodRow}>
              <Button
                mode="contained-tonal"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // 🔹 Vibration added
                  setPeriodDialogVisible(true);
                }}
                style={styles.periodButton}
                contentStyle={styles.periodButtonContent}
                labelStyle={styles.periodButtonLabel}
                icon="chevron-down"
              >
                {calc.period}
              </Button>
            </View>

            <Divider style={styles.salaryDivider} />

            <Text style={styles.adjustLabel}>Adjust salary</Text>
            <Slider
              minimumValue={0}
              maximumValue={10000}
              step={10}
              value={calc.salaryValue}
              onValueChange={calc.setSalaryValue}
              minimumTrackTintColor={Colors.accent}
              maximumTrackTintColor="rgba(249,250,251,0.18)"
              thumbTintColor={Colors.accent}
              style={styles.salarySlider}
            />
          </View>
        </Card>

        {/* Work Schedule */}
        <SectionCard title="Work Schedule">
          <QuestionSlider
            question="How many hours do you work per day?"
            valueLabel={`${calc.hoursPerDay} hours / day`}
            min={1}
            max={16}
            step={1}
            value={calc.hoursPerDay}
            onChange={calc.setHoursPerDay}
            onPressEdit={() =>
              openEdit("hoursPerDay", {
                title: "Hours per Day",
                allowDecimal: false,
                min: 1,
                max: 24,
              })
            }
          />

          <Spacer />

          <QuestionSlider
            question="How many days do you work per week?"
            valueLabel={`${calc.daysPerWeek} days / week  •  ${hpw} hrs`}
            min={1}
            max={7}
            step={1}
            value={calc.daysPerWeek}
            onChange={calc.setDaysPerWeek}
            onPressEdit={() =>
              openEdit("daysPerWeek", {
                title: "Days per Week",
                allowDecimal: false,
                min: 1,
                max: 7,
              })
            }
          />
        </SectionCard>

        {/* Overtime */}
        <SectionCard title="Overtime Details" badge="New">
          <QuestionSlider
            question="How many overtime hours do you work per week?"
            valueLabel={`${calc.otHoursPerWeek} hrs / week`}
            min={0}
            max={30}
            step={1}
            value={calc.otHoursPerWeek}
            onChange={calc.setOtHoursPerWeek}
            onPressEdit={() =>
              openEdit("otHours", {
                title: "Overtime Hours / Week",
                allowDecimal: false,
                min: 0,
                max: 80,
              })
            }
          />

          <Spacer />

          <QuestionSlider
            question="What is your overtime multiplier?"
            valueLabel={`${round2(calc.otMultiplier)}x regular pay`}
            min={1}
            max={3}
            step={0.1}
            value={calc.otMultiplier}
            onChange={calc.setOtMultiplier}
            footer={`${currencyUSD(overtimeHourly)} / hr overtime pay`}
            onPressEdit={() =>
              openEdit("otMultiplier", {
                title: "Overtime Multiplier",
                suffix: "x",
                allowDecimal: true,
                min: 1,
                max: 5,
              })
            }
          />
        </SectionCard>

        {/* Tax */}
        <SectionCard title="Tax Adjustment" badge="New">
          <QuestionSlider
            question="What is your tax rate?"
            valueLabel={`${calc.taxRate}% tax rate`}
            min={0}
            max={50}
            step={0.5}
            value={calc.taxRate}
            onChange={calc.setTaxRate}
            footer={`${currencyUSD(netYearly)} / year after tax`}
            onPressEdit={() =>
              openEdit("taxRate", {
                title: "Tax Rate",
                suffix: "%",
                allowDecimal: true,
                min: 0,
                max: 60,
              })
            }
          />
        </SectionCard>

        {/* Calculate Button */}
        <Button
          mode="contained"
          style={styles.calculateBtn}
          contentStyle={styles.calculateBtnContent}
          labelStyle={styles.calculateBtnLabel}
          onPress={async () => {
            // 🔹 Added Vibration (Medium Impact)
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
            await playCalculateSound(); // 🔹 Trigger unique sound
            router.push({
              pathname: "/salary-results",
              params: {
                baseValue: String(calc.salaryValue),
                period: calc.period,
                hpw: String(calc.result.hpw),
                taxRate: String(calc.taxRate),
              },
            });
          }}
        >
          Calculate
        </Button>
      </ScrollView>

      {/* Period selection dialog */}
      <Portal>
        <Dialog
          visible={periodDialogVisible}
          onDismiss={() => setPeriodDialogVisible(false)}
          style={{ borderRadius: 24 }} // Added rounded corners
        >
          <Dialog.Title style={{ textAlign: 'center' }}>Select period</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // 🔹 Vibration on selection
                calc.setPeriod(value);
                setPeriodDialogVisible(false);
              }}
              value={calc.period}
            >
              <View style={{ alignItems: 'center' }}> 
                {periods.map((p) => (
                  <View
                    key={p}
                    style={{ flexDirection: "row", alignItems: "center", marginVertical: 4, width: 120 }}
                  >
                    <RadioButton value={p} color={Colors.accent} />
                    <Text style={{ fontSize: 16 }}>{p}</Text>
                  </View>
                ))}
              </View>
            </RadioButton.Group>
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* Numeric keypad modal */}
      <NumberPadModal
        visible={edit.visible}
        title={edit.title}
        prefix={edit.prefix}
        suffix={edit.suffix}
        allowDecimal={edit.allowDecimal}
        initialValue={getInitialValue()}
        min={edit.min}
        max={edit.max}
        onClose={closeEdit}
        onSave={saveValue}
      />
    </SafeAreaView>
  );
}

function Spacer() {
  return <View style={{ height: 18 }} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 56,
    paddingBottom: 110, // Adjusted for the high tab bar
    gap: 22,
  },
  salaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.cardEdge,
    elevation: 0,
  },
  salaryInner: {
    padding: 18,
    paddingTop: 14,
    paddingBottom: 16,
  },
  salaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  salaryLabel: {
    color: Colors.muted,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  pencilBtn: { margin: 0 },
  salaryValue: {
    color: Colors.text,
    fontSize: 48,
    fontWeight: "900",
    marginTop: 6,
  },
  periodRow: {
    marginTop: 10,
    alignItems: "flex-start",
  },
  periodButton: {
    borderRadius: 18,
    backgroundColor: "rgba(15,23,42,0.4)",
  },
  periodButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: "row-reverse",
  },
  periodButtonLabel: {
    color: Colors.text,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  salaryDivider: {
    backgroundColor: "rgba(249,250,251,0.16)",
    marginTop: 14,
  },
  adjustLabel: {
    marginTop: 12,
    color: Colors.muted2,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  salarySlider: { marginTop: 4 },
  calculateBtn: {
    borderRadius: 16,
    backgroundColor: Colors.accent,
    marginTop: 4,
    shadowColor: Colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  calculateBtnContent: {
    paddingVertical: 10,
  },
  calculateBtnLabel: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
// app/(tabs)/settings.jsx
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  Linking,
} from "react-native";
import {
  Text,
  Card,
  IconButton,
  TouchableRipple,
} from "react-native-paper";

import { Colors } from "../../src/constants/colors";

export default function SettingsScreen() {
  const appVersion = "1.5.2"; // change if you want

  const handleSubscription = () => {
    console.log("Open Subscription Center");
    // e.g. Linking.openURL("https://your-subscription-page.com");
  };

  const handleRequestFeature = () => {
    console.log("Request a feature tapped");
    // Example: open email
    // Linking.openURL("mailto:support@yourapp.com?subject=Feature%20Request");
  };

  const handleReportBug = () => {
    console.log("Report a bug tapped");
    // Linking.openURL("mailto:support@yourapp.com?subject=Bug%20Report");
  };

  const handleRateUs = () => {
    console.log("Rate us tapped");
    // TODO: open Play Store link
    // Linking.openURL("market://details?id=com.yourapp.id");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Settings</Text>

        {/* Subscription section */}
        <Text style={styles.sectionLabel}>Subscription</Text>
        <SettingRow
          emoji="🎁"
          label="Subscription Center"
          onPress={handleSubscription}
        />

        {/* Configuration section */}
        <Text style={styles.sectionLabel}>Configuration</Text>
        <SettingRow
          emoji="💰"
          label="Currency"
          disabled
          right={
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Coming Soon</Text>
            </View>
          }
        />

        {/* Support section */}
        <Text style={styles.sectionLabel}>Support</Text>
        <SettingRow
          emoji="🚀"
          label="Request a Feature"
          onPress={handleRequestFeature}
        />
        <SettingRow
          emoji="🐞"
          label="Report a Bug or Issue"
          onPress={handleReportBug}
        />
        <SettingRow emoji="✨" label="Rate Us" onPress={handleRateUs} />

        {/* Version row */}
        <Card style={[styles.rowCard, styles.versionCard]}>
          <View style={styles.versionInner}>
            <Text style={styles.versionLabel}>Version</Text>
            <Text style={styles.versionValue}>{appVersion}</Text>
          </View>
        </Card>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/** Reusable row component */
function SettingRow({ emoji, label, right, onPress, disabled }) {
  return (
    <Card
      style={[styles.rowCard, disabled && styles.rowCardDisabled]}
      elevation={0}
    >
      <TouchableRipple
        disabled={disabled}
        onPress={onPress}
        borderless={false}
        style={styles.ripple}
      >
        <View style={styles.rowInner}>
          <Text style={styles.rowLabel}>
            {emoji && <Text style={styles.rowEmoji}>{emoji} </Text>}
            {label}
          </Text>

          <View style={styles.rowRight}>
            {right}
            {!disabled && (
              <IconButton
                icon="chevron-right"
                size={20}
                iconColor="rgba(226,232,240,0.9)"
                style={styles.chevronIcon}
              />
            )}
          </View>
        </View>
      </TouchableRipple>
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
    gap: 10,
  },

  headerTitle: {
    textAlign: "center",
    color: Colors.text,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0.3,
    marginBottom: 20,
  },

  sectionLabel: {
    marginTop: 12,
    marginBottom: 6,
    color: Colors.muted,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.4,
  },

  rowCard: {
    borderRadius: 24,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardEdge,
    overflow: "hidden",
  },
  rowCardDisabled: {
    opacity: 0.8,
  },
  ripple: {
    borderRadius: 24,
  },
  rowInner: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rowLabel: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  rowEmoji: {
    fontSize: 16,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  chevronIcon: {
    margin: 0,
    marginLeft: 4,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.accent,
  },
  badgeText: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "800",
  },

  versionCard: {
    marginTop: 18,
  },
  versionInner: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  versionLabel: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  versionValue: {
    color: Colors.muted2,
    fontSize: 14,
    fontWeight: "600",
  },
});

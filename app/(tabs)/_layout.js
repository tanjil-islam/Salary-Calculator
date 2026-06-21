import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../src/constants/colors";
import { Platform, Pressable } from "react-native";
import * as Haptics from 'expo-haptics'; // 🔹 Added for vibration

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: "rgba(232,234,247,0.55)",
        // 🔹 Global logic to trigger vibration on every tab press
        tabBarButton: (props) => (
          <Pressable
            {...props}
            onPress={(e) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // 🔹 Soft vibration on tap
              props.onPress?.(e);
            }}
          />
        ),
        tabBarStyle: {
          backgroundColor: "#2B2C41",
          borderTopColor: "rgba(255,255,255,0.08)",
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 100 : 85, 
          paddingBottom: Platform.OS === 'ios' ? 38 : 25, 
          paddingTop: 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" color={color} size={size + 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bookmark-check" color={color} size={size + 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="compare"
        options={{
          title: "Compare",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="swap-horizontal-variant" color={color} size={size + 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" color={color} size={size + 2} />
          ),
        }}
      />
    </Tabs>
  );
}
// app/(tabs)/saved.jsx
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Text, Card, ActivityIndicator } from "react-native-paper";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { Colors } from "../../src/constants/colors";
import { getHistory } from "../../src/storage/history";
import { currencyUSD } from "../../src/logic/salary";

export default function SavedScreen() {
  const router = useRouter();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // load history whenever this tab gains focus
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const load = async () => {
        try {
          setLoading(true);
          const data = await getHistory();
          if (isActive) {
            setItems(data);
          }
        } finally {
          if (isActive) setLoading(false);
        }
      };

      load();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleOpenItem = (item) => {
    router.push({
      pathname: "/salary-results",
      params: {
        id: item.id,                        // 🔹 used for delete
        label: item.label,                  // 🔹 name in header
        baseValue: String(item.baseValue),
        period: item.period,
        hpw: String(item.hpw),
        taxRate: String(item.taxRate),
      },
    });
  };

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyTitle}>No saved salaries yet</Text>
      <Text style={styles.emptySubtitle}>
        Calculate a salary and tap “Save” to store it here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Saved</Text>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={Colors.accent} />
          </View>
        ) : items.length === 0 ? (
          renderEmpty()
        ) : (
          <View style={{ marginTop: 16, gap: 12 }}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => handleOpenItem(item)}
              >
                <Card style={styles.itemCard}>
                  <View style={styles.itemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.label || "Unnamed"}</Text>
                      <Text style={styles.itemMeta}>
                        {formatDate(item.createdAt)} •{" "}
                        {currencyUSD(item.grossYearly)} / yr
                      </Text>
                    </View>
                    <Text style={styles.chevron}>{">"}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
  },
  headerTitle: {
    textAlign: "center",
    color: Colors.text,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0.3,
    marginBottom: 12,
  },
  loaderWrap: {
    marginTop: 32,
    alignItems: "center",
  },
  emptyWrap: {
    marginTop: 48,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  emptySubtitle: {
    color: Colors.muted2,
    fontSize: 14,
    textAlign: "center",
  },
  itemCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.cardEdge,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  itemName: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 2,
  },
  itemMeta: {
    color: Colors.muted2,
    fontSize: 13,
  },
  chevron: {
    color: Colors.muted2,
    fontSize: 20,
    fontWeight: "800",
    marginLeft: 8,
  },
});

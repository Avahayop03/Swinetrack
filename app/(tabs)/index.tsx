import { Text, View, StyleSheet, StatusBar} from "react-native";

export default function Index() {
  return (
    <View style={styles.view}
    >
            <StatusBar barStyle="light-content" />
      
      <Text>ers</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    view: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }
})
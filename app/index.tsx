import { Text, View } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold text-gray-900">Moiney</Text>
      <Text className="mt-2 text-base text-gray-500">
        Your financial companion
      </Text>
    </View>
  );
}

import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Controller } from "react-hook-form";

interface MyInputProps {
  label: string;
  name: string;
  control: any;
  isSecure?: boolean;
}

export const MyInput: React.FC<MyInputProps> = ({
  label,
  name,
  control,
  isSecure = false,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View>
          <View
            style={[
              styles.container,
              fieldState.invalid
                ? styles.containerError
                : styles.containerNormal,
            ]}
          >
            <TextInput
              secureTextEntry={isSecure}
              onChangeText={field.onChange}
              value={field.value}
              placeholder={label}
              placeholderTextColor="#6b7280"
              style={[
                styles.input,
                fieldState.invalid ? styles.inputError : styles.inputNormal,
              ]}
            />
          </View>
          {fieldState.invalid && (
            <Text style={styles.errorText}>{fieldState.error?.message}</Text>
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  containerNormal: {
    borderColor: "black",
    backgroundColor: "#fff",
    borderWidth: 1,
  },
  containerError: {
    borderColor: "#dc2626",
    backgroundColor: "#fee2e2",
  },
  input: {
    width: "90%",
    paddingVertical: 12,
    paddingHorizontal: 5,
    fontSize: 16,
    borderRadius: 10,
  },
  inputNormal: {
    color: "#000", // Default text color
  },
  inputError: {
    color: "#dc2626", // Red text color for error
  },
  errorText: {
    color: "red",
    fontSize: 12,
    textAlign: "left",
    marginBottom: 10, // Add space between error text and other elements
    marginLeft: 40,
  },
});

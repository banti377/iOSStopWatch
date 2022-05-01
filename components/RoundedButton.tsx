import {StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import React from 'react';
import {COLORS} from '../utils/constants';

interface IProps {
  bgColor?: string;
  textColor?: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

const RoundedButton = ({
  onPress,
  bgColor,
  textColor,
  label,
  disabled = false,
}: IProps) => {
  return (
    <TouchableWithoutFeedback
      disabled={disabled}
      onPress={() => {
        onPress();
      }}>
      <View style={[styles.button, bgColor ? {backgroundColor: bgColor} : {}]}>
        <Text style={[styles.buttonText, textColor ? {color: textColor} : {}]}>
          {label}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default RoundedButton;

const styles = StyleSheet.create({
  button: {
    height: 80,
    width: 80,
    borderRadius: 99,
    backgroundColor: COLORS.grayBg,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 23,
    color: COLORS.grayText,
  },
});

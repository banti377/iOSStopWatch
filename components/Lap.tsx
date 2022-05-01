import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

interface IProps {
  label: string;
  value: string;
}

const Lap = ({label, value}: IProps) => {
  return (
    <View style={styles.lapContainer}>
      <Text style={styles.lapText}>{label}</Text>
      <Text style={styles.lapText}>{value}</Text>
    </View>
  );
};

export default Lap;

const styles = StyleSheet.create({
  lapContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  lapText: {
    fontSize: 20,
  },
});

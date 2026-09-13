import { StyleSheet, Text, View } from 'react-native';
import { palette, spacing } from '../theme/theme';

export default function ReportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '600',
  },
});
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function TrialsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TRIALS</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Active Trials</Text>
        <Text style={styles.subtitle}>Test your knowledge and skills</Text>

        <View style={styles.trialCard}>
          <Text style={styles.trialTitle}>Mathematical Reasoning</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
          <Text style={styles.progressText}>75% Complete</Text>
        </View>

        <View style={styles.trialCard}>
          <Text style={styles.trialTitle}>Scientific Method</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '42%' }]} />
          </View>
          <Text style={styles.progressText}>42% Complete</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE4D6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(237, 228, 214, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(23, 23, 23, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#32704E',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10443E',
    letterSpacing: 3,
    fontFamily: 'serif',
  },
  content: {
    flex: 1,
    padding: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10443E',
    fontFamily: 'serif',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#32704E',
    fontFamily: 'serif',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 40,
  },
  trialCard: {
    backgroundColor: '#D9D1C2',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trialTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#171717',
    fontFamily: 'serif',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#CFC7B8',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10443E',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#171717',
    textAlign: 'right',
  },
});
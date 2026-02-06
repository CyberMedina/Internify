import React from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import { useTheme } from '../theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import JobCardLarge, { Job } from '../components/JobCardLarge';

export default function SuggestedJobsScreen() {
  const { colors, spacing, typography } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { jobs } = route.params as { jobs: Job[] };

  return (
    <ScreenContainer safeTop>
       <View style={{ 
        height: 56,
        paddingHorizontal: spacing(2), 
        flexDirection: 'row', 
        alignItems: 'center', 
      }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 20, 
            backgroundColor: colors.surface, 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <Feather name="arrow-left" size={18} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={{ marginLeft: spacing(2), color: colors.text, fontWeight: '700', fontSize: typography.sizes.lg }}>
          Trabajos Sugeridos
        </Text>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing(2), paddingTop: spacing(1), paddingBottom: spacing(4) }}
        renderItem={({ item }) => (
          <View style={{ marginBottom: spacing(2) }}>
            <JobCardLarge job={item} showBookmark={true} style={{ width: '100%' }} />
          </View>
        )}
      />
    </ScreenContainer>
  );
}

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent, Platform, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';
import { onboardingSteps } from '../../mock/onboardingSteps';
import { useTheme } from '../../theme/ThemeContext';
import GradientButton from '../../components/GradientButton';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Process'>;

const { width, height } = Dimensions.get('window');
const scale = width / 390;
const normalize = (size: number) => Math.round(size * scale);

const SLIDE_WIDTH = width;
const CARD_WIDTH = width * 0.85;

export default function OnboardingProcessScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SLIDE_WIDTH);
    setCurrentIndex(index);
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SLIDE_WIDTH);
    setCurrentIndex(index);
  };

  const handleFinish = () => {
    navigation.navigate('Completion');
  };

  const renderItem = ({ item, index }: { item: typeof onboardingSteps[0]; index: number }) => (
    <View style={styles.slide}>
      <Animated.View
        entering={FadeInDown.delay(index * 120).springify()}
        style={[
          styles.cardContainer,
          index === currentIndex ? styles.cardActive : styles.cardInactive,
        ]}
      >
        <LinearGradient
          colors={item.colors}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.yearTag}>
              <Text style={styles.yearText}>{item.year}</Text>
            </View>
            <View style={styles.iconContainer}>
              {item.isIntro ? (
                <Image 
                  source={require('../../assets/images/InternifyV4NoLogo.png')} 
                  style={{ width: normalize(32), height: normalize(32), tintColor: '#FFF' }} 
                  resizeMode="contain"
                />
              ) : (
                <FontAwesome5 name={item.icon} size={normalize(24)} color="#FFF" />
              )}
            </View>
          </View>

          <View style={styles.cardContent}>
            <View>
              <Text 
                style={styles.cardTitle}
                adjustsFontSizeToFit
                numberOfLines={1}
                minimumFontScale={0.8}
              >
                {item.title}
              </Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              {item.isIntro && (
                <Text style={styles.introDescription}>{item.description}</Text>
              )}
            </View>

            {!item.isIntro && (
              <>
                <View style={styles.statsContainer}>
                  <View style={styles.statBox}>
                    <FontAwesome5 name="clock" size={normalize(16)} color="rgba(255,255,255,0.9)" style={{ marginBottom: 8 }} />
                    <Text style={styles.statLabel}>Duración</Text>
                    <Text style={styles.statValue}>{item.duration}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <FontAwesome5 name="star" size={normalize(16)} color="rgba(255,255,255,0.9)" style={{ marginBottom: 8 }} />
                    <Text style={styles.statLabel}>Créditos</Text>
                    <Text style={styles.statValue}>{item.credits}</Text>
                  </View>
                </View>

                <View style={styles.requirementBox}>
                  <View style={styles.requirementHeader}>
                    <FontAwesome5 name="check-circle" size={normalize(18)} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.requirementLabel}>
                      {item.requirements.length > 1 ? 'Requisitos principales' : 'Requisito principal'}
                    </Text>
                  </View>
                  {item.requirements.map((req, i) => (
                    <View key={i}>
                      {i > 0 && <View style={styles.requirementDivider} />}
                      <Text style={styles.requirementValue}>{req}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          <View style={styles.cardFooter}>
            {!item.isIntro ? (
              <View style={styles.articleTag}>
                <Text style={styles.articleText}>{item.article}</Text>
              </View>
            ) : <View />}
            
            {index < onboardingSteps.length - 1 ? (
              <Text style={styles.swipeText}>Desliza para ver más →</Text>
            ) : (
              <View style={{ width: 140 }}>
                <GradientButton
                  onPress={handleFinish}
                  title="Comenzar"
                  icon={<FontAwesome5 name="arrow-right" size={14} color={item.colors[1]} />}
                  iconPosition="right"
                  style={{ height: 44, borderRadius: 22 }}
                  textStyle={{ fontSize: 15, color: item.colors[1] }}
                  gradientColors={['#FFF', '#FFF']}
                />
              </View>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );

  return (
    <ScreenContainer safeTop safeBottom style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: colors.primary }]}>
          <FontAwesome5 name="graduation-cap" size={20} color="#FFF" />
        </View>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Prácticas UNI</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Tu ruta profesional</Text>
        </View>
      </View>

      <View style={styles.pagination}>
        {onboardingSteps.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex ? colors.text : colors.border,
                width: index === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <FlatList
        data={onboardingSteps}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    marginBottom: 10,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: normalize(18),
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: normalize(14),
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  slide: {
    width: SLIDE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: height * 0.7,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 14,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 32,
    padding: 24,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  yearTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  yearText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: normalize(14),
  },
  iconContainer: {
    width: normalize(52),
    height: normalize(52),
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  cardTitle: {
    color: '#FFF',
    fontSize: normalize(28),
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: normalize(16),
    marginBottom: 16,
    fontWeight: '500',
  },
  introDescription: {
    color: '#FFF',
    fontSize: normalize(18),
    lineHeight: normalize(26),
    fontWeight: '500',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 26,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  statBox: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 24,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: normalize(13),
    marginBottom: 6,
    fontWeight: '500',
  },
  statValue: {
    color: '#FFF',
    fontSize: normalize(26),
    fontWeight: '700',
  },
  requirementBox: {
    backgroundColor: 'rgba(15,23,42,0.14)',
    borderRadius: 26,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  requirementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementLabel: {
    color: '#FFF',
    fontSize: normalize(14),
    fontWeight: '600',
  },
  requirementValue: {
    color: '#FFF',
    fontSize: normalize(15),
    fontWeight: '700',
    lineHeight: normalize(20),
  },
  requirementDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  articleTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 12,
  },
  articleText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: normalize(12),
    fontWeight: '600',
  },
  swipeText: {
    color: '#FFF',
    fontSize: normalize(14),
    opacity: 0.95,
    fontWeight: '500',
  },
  finishButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  finishButtonText: {
    fontWeight: '800',
    fontSize: normalize(15),
  },
  cardActive: {
    transform: [{ scale: 1 }, { translateY: 0 }],
    opacity: 1,
  },
  cardInactive: {
    transform: [{ scale: 0.94 }, { translateY: 14 }],
    opacity: 0.9,
  },
});

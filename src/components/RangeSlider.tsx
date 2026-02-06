import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const THUMB_SIZE = 24;

interface Props {
  min: number;
  max: number;
  step: number;
  initialMin?: number;
  initialMax?: number;
  onValuesChange: (min: number, max: number) => void;
}

const RangeSlider = ({ min, max, step, initialMin, initialMax, onValuesChange }: Props) => {
  const { colors, typography } = useTheme();
  
  const [containerWidth, setContainerWidth] = useState(0);
  const [minVal, setMinVal] = useState(initialMin || min);
  const [maxVal, setMaxVal] = useState(initialMax || max);

  // Refs to track latest state for PanResponders
  const minValRef = useRef(minVal);
  const maxValRef = useRef(maxVal);
  const containerWidthRef = useRef(0);

  // We keep track of the value start during the gesture
  const startMinVal = useRef(minVal);
  const startMaxVal = useRef(maxVal);

  useEffect(() => {
    minValRef.current = minVal;
    maxValRef.current = maxVal;
  }, [minVal, maxVal]);

  useEffect(() => {
    // If props change externally (like reset), update state
    if (initialMin !== undefined) setMinVal(initialMin);
    if (initialMax !== undefined) setMaxVal(initialMax);
  }, [initialMin, initialMax]);

  const valueToPos = (val: number) => {
    if (containerWidth === 0) return 0;
    return ((val - min) / (max - min)) * (containerWidth - THUMB_SIZE); // Subtract Thumb size to keep inside
  };

  const posToValue = (pos: number) => {
    if (containerWidth === 0) return min;
    const ratio = Math.max(0, Math.min(1, pos / (containerWidth - THUMB_SIZE)));
    const rawVal = min + ratio * (max - min);
    return Math.round(rawVal / step) * step;
  };

  const panResponderMin = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        startMinVal.current = minValRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        const width = containerWidthRef.current;
        if (width === 0) return;
        
        // Calculate position based on the START value + Delta
        const pixelsPerValue = (width - THUMB_SIZE) / (max - min);
        const startPos = (startMinVal.current - min) * pixelsPerValue;
        const newPos = startPos + gestureState.dx;
        
        // Convert back to value
        const ratio = Math.max(0, Math.min(1, newPos / (width - THUMB_SIZE)));
        const rawVal = min + ratio * (max - min);
        let newVal = Math.round(rawVal / step) * step;
        
        // Constraints
        const currentMax = maxValRef.current;
        newVal = Math.max(min, Math.min(newVal, currentMax - step));
        
        // Update local state for UI (render)
        setMinVal(newVal);
        // Update ref immediately so Release handler has correct value
        minValRef.current = newVal;
      },
      onPanResponderRelease: () => {
        onValuesChange(minValRef.current, maxValRef.current);
      },
      onPanResponderTerminate: () => {
        onValuesChange(minValRef.current, maxValRef.current);
      },
    })
  ).current;

  const panResponderMax = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        startMaxVal.current = maxValRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        const width = containerWidthRef.current;
        if (width === 0) return;

        const pixelsPerValue = (width - THUMB_SIZE) / (max - min);
        const startPos = (startMaxVal.current - min) * pixelsPerValue;
        const newPos = startPos + gestureState.dx;
        
        const ratio = Math.max(0, Math.min(1, newPos / (width - THUMB_SIZE)));
        const rawVal = min + ratio * (max - min);
        let newVal = Math.round(rawVal / step) * step;

        const currentMin = minValRef.current;
        newVal = Math.max(currentMin + step, Math.min(newVal, max));

        // Update local state for UI (render)
        setMaxVal(newVal);
        // Update ref immediately
        maxValRef.current = newVal;
      },
      onPanResponderRelease: () => {
        onValuesChange(minValRef.current, maxValRef.current);
      },
      onPanResponderTerminate: () => {
        onValuesChange(minValRef.current, maxValRef.current);
      },
    })
  ).current;

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContainerWidth(w);
    containerWidthRef.current = w;
  };
  
  // Calculate positions for rendering
  const minPos = valueToPos(minVal);
  const maxPos = valueToPos(maxVal);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container} onLayout={handleLayout}>
        {/* Track Background */}
        <View style={[styles.track, { backgroundColor: colors.border }]} />
        
        {/* Active Selection Track */}
        <View 
          style={[
            styles.track, 
            { 
              backgroundColor: colors.primary,
              left: minPos + THUMB_SIZE/2, 
              width: Math.max(0, maxPos - minPos) 
            }
          ]} 
        />

        {/* Min Thumb */}
        <View
          style={[
            styles.thumb, 
            { 
                left: minPos, 
                backgroundColor: colors.card,
                borderColor: colors.primary
            }
          ]}
          {...panResponderMin.panHandlers}
        />

        {/* Max Thumb */}
        <View
          style={[
            styles.thumb, 
            { 
                left: maxPos,
                backgroundColor: colors.card,
                borderColor: colors.primary
            }
          ]}
          {...panResponderMax.panHandlers}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 10,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    height: 30,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    width: '100%',
    top: 13, // Center vertically (30/2 - 4/2)
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 2,
    position: 'absolute',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    top: 3, // Center vertically (30/2 - 24/2)
  }
});

export default RangeSlider;

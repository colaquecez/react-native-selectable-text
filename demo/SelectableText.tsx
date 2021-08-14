import React, { ReactNode } from 'react'
import { Text, requireNativeComponent, Platform, TextStyle, StyleProp, TextProps, TextInputProps, ColorValue } from 'react-native'
import { v4 } from 'uuid'
import memoize from 'fast-memoize'


const RNSelectableText = requireNativeComponent('RNSelectableText')
export interface IHighlights {
  start: number,
  end: number,
  id: string,
}

export interface NativeEvent {
  content: string,
  eventType: string,
  selectionStart: number,
  selectionEnd: number
}
export interface SelectableTextProps {
  value: string;
  onSelection: (args: {
    eventType: string;
    content: string;
    selectionStart: number;
    selectionEnd: number;
  }) => void;

  menuItems: string[];
  highlights?: Array<IHighlights>;
  highlightColor?: ColorValue;
  style?: StyleProp<TextStyle>;
  onHighlightPress?: (id: string) => void;
  appendToChildren?: ReactNode;
  TextComponent?: ReactNode;
  textValueProp?: string;
  textComponentProps?: TextProps | TextInputProps;
}

/**
 * numbers: array({start: int, end: int, id: string})
 */
const combineHighlights = memoize((numbers: IHighlights[]) => {
  return numbers
    .sort((a, b) => a.start - b.start || a.end - b.end)
    .reduce(function (combined, next) {
      if (!combined.length || combined[combined.length - 1].end < next.start) combined.push(next)
      else {
        var prev = combined.pop();
        if (prev)
          combined.push({
            start: prev.start,
            end: Math.max(prev.end, next.end),
            id: next.id,
          })
      }
      return combined
    }, [] as IHighlights[])
})

/**
 * value: string
 * highlights: array({start: int, end: int, id: any})
 */
const mapHighlightsRanges = (value: string, highlights: IHighlights[]) => {
  const combinedHighlights = combineHighlights(highlights)

  if (combinedHighlights.length === 0) return [{ isHighlight: false, text: value, id: undefined }]

  const data = [{ isHighlight: false, text: value.slice(0, combinedHighlights[0].start), id: combinedHighlights[0].id }]

  combinedHighlights.forEach(({ start, end, id }, idx) => {
    data.push({
      isHighlight: true,
      text: value.slice(start, end),
      id: id
    })

    if (combinedHighlights[idx + 1]) {
      data.push({
        isHighlight: false,
        text: value.slice(end, combinedHighlights[idx + 1].start),
        id: combinedHighlights[idx + 1].id
      })
    }
  })

  data.push({
    isHighlight: false,
    text: value.slice(combinedHighlights[combinedHighlights.length - 1].end, value.length),
    id: combinedHighlights[combinedHighlights.length - 1].id
  })

  return data.filter(x => x.text)
}

/**
 * Props
 * ...TextProps
 * onSelection: ({ content: string, eventType: string, selectionStart: int, selectionEnd: int }) => void
 * children: ReactNode
 * highlights: array({ id, start, end })
 * highlightColor: string
 * onHighlightPress: string => void
 * textValueProp: string
 * TextComponent: ReactNode
 * textComponentProps: object
 */
export const SelectableText = ({ onSelection, onHighlightPress, textValueProp, value, TextComponent, textComponentProps, ...props }: SelectableTextProps) => {
  TextComponent = TextComponent || Text;
  textValueProp = textValueProp || 'children';  // default to `children` which will render `value` as a child of `TextComponent`
  const onSelectionNative = (event: any) => {
    var nativeEvent =event.nativeEvent as NativeEvent
    onSelection && onSelection(nativeEvent);
  }

  const onHighlightPressNative = onHighlightPress
    ? Platform.OS === 'ios'
      ? ({ nativeEvent: { clickedRangeStart, clickedRangeEnd } }) => {
        if (!props.highlights || props.highlights.length === 0) return

        const mergedHighlights = combineHighlights(props.highlights)

        const hightlightInRange = mergedHighlights.find(
          ({ start, end }) => clickedRangeStart >= start - 1 && clickedRangeEnd <= end + 1,
        )

        if (hightlightInRange) {
          onHighlightPress(hightlightInRange.id)
        }
      }
      : onHighlightPress
    : () => { }

  // highlights feature is only supported if `TextComponent == Text`
  let textValue = value as any;
  if (TextComponent == Text) {
    console.log("Using Text")
    textValue = (
      props.highlights && props.highlights.length > 0
        ? mapHighlightsRanges(value, props.highlights).map(({ id, isHighlight, text }) => (
          <Text key={v4()} selectable={true} style={isHighlight ? { backgroundColor: props.highlightColor } : {}} onPress={() => {
            if (isHighlight) {
              onHighlightPress && onHighlightPress(id ?? "")
            }
          }}>
            {text} </Text>
        ))
        : [value]
    );
    if (props.appendToChildren) {
      textValue.push(props.appendToChildren);
    }
  }
  return (
    <RNSelectableText {...props} onHighlightPress={onHighlightPressNative} selectable={true} onSelection={onSelectionNative} >
      <TextComponent key={v4()} {...{ [textValueProp]: textValue, ...textComponentProps }} />
    </RNSelectableText>
  )
}
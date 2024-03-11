/* #if __has_include(<RCTText/RCTTextSelection.h>) */
/* #import <RCTText/RCTTextSelection.h> */
/* #else */
#import <React/RCTTextSelection.h>
/* #endif */

/* #if __has_include(<RCTText/RCTUITextView.h>) */
/* #import <RCTText/RCTUITextView.h> */
/* #else */
#import <React/RCTUITextView.h>
/* #endif */

#import "RNSelectableTextView.h"

/* #if __has_include(<RCTText/RCTTextAttributes.h>) */
/* #import <RCTText/RCTTextAttributes.h> */
/* #else */
#import <React/RCTTextAttributes.h>
/* #endif */

#import <React/RCTUtils.h>

@implementation RNSelectableTextView
{
    RCTUITextView *_backedTextInputView;
}

NSString *const SELECTOR_CUSTOM = @"_SELECTOR_CUSTOM_";

UITextPosition *selectionStart;
UITextPosition* beginning;

- (instancetype)initWithBridge:(RCTBridge *)bridge
{
    if (self = [super initWithBridge:bridge]) {
        _backedTextInputView = [[RCTUITextView alloc] initWithFrame:self.bounds];
        _backedTextInputView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
        _backedTextInputView.backgroundColor = [UIColor clearColor];
        _backedTextInputView.textColor = [UIColor blackColor];
        // This line actually removes 5pt (default value) left and right padding in UITextView.
        _backedTextInputView.textContainer.lineFragmentPadding = 0;
#if !TARGET_OS_TV
        _backedTextInputView.scrollsToTop = NO;
#endif
        _backedTextInputView.scrollEnabled = NO;
        _backedTextInputView.textInputDelegate = self;
        _backedTextInputView.editable = NO;
        _backedTextInputView.selectable = YES;
        _backedTextInputView.contextMenuHidden = YES;

        beginning = _backedTextInputView.beginningOfDocument;

        for (UIGestureRecognizer *gesture in [_backedTextInputView gestureRecognizers]) {
            if (
                [gesture isKindOfClass:[UIPanGestureRecognizer class]]
            ) {
                [_backedTextInputView setExclusiveTouch:NO];
                gesture.enabled = YES;
            } else {
                gesture.enabled = NO;
            }
        }

        [self addSubview:_backedTextInputView];

        UILongPressGestureRecognizer *longPressGesture = [[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(handleLongPress:)];
        UITapGestureRecognizer *tapGesture = [ [UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleTap:)];
        tapGesture.numberOfTapsRequired = 2;

        UITapGestureRecognizer *singleTapGesture = [ [UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleSingleTap:)];
        singleTapGesture.numberOfTapsRequired = 1;

        [_backedTextInputView addGestureRecognizer:longPressGesture];
        [_backedTextInputView addGestureRecognizer:tapGesture];
        [_backedTextInputView addGestureRecognizer:singleTapGesture];

        [self setUserInteractionEnabled:YES];
    }

    return self;
}

-(void) _handleGesture
{
    if (!_backedTextInputView.isFirstResponder) {
        [_backedTextInputView becomeFirstResponder];
    }

    UIMenuController *menuController = [UIMenuController sharedMenuController];

    if (menuController.isMenuVisible) return;

    NSMutableArray *menuControllerItems = [NSMutableArray arrayWithCapacity:self.menuItems.count];

    UITextRange *selectedRange = _backedTextInputView.selectedTextRange;
    if ([_backedTextInputView offsetFromPosition:selectedRange.start toPosition:selectedRange.end] == 0) {
        // If the selection length is zero, don't show the menu.
        return;
    }

    for(NSString *menuItemName in self.menuItems) {
        NSString *sel = [NSString stringWithFormat:@"%@%@", SELECTOR_CUSTOM, menuItemName];
        UIMenuItem *item = [[UIMenuItem alloc] initWithTitle: menuItemName
                                                      action: NSSelectorFromString(sel)];

        [menuControllerItems addObject: item];
    }

    menuController.menuItems = menuControllerItems;
    [menuController setTargetRect:self.bounds inView:self];
    [menuController setMenuVisible:YES animated:YES];
}

-(void) handleSingleTap: (UITapGestureRecognizer *) gesture
{
    CGPoint pos = [gesture locationInView:_backedTextInputView];
    pos.y += _backedTextInputView.contentOffset.y;

    UITextPosition *tapPos = [_backedTextInputView closestPositionToPoint:pos];
    UITextRange *word = [_backedTextInputView.tokenizer rangeEnclosingPosition:tapPos withGranularity:UITextGranularityWord inDirection:UITextLayoutDirectionRight];

    if (!word) {
        // If no word is found at the tap position, return without selecting anything.
        return;
    }

    // Calculate the start and end position of the selection in terms of the text view's content.
    NSInteger location = [_backedTextInputView offsetFromPosition:_backedTextInputView.beginningOfDocument toPosition:word.start];
    NSInteger length = [_backedTextInputView offsetFromPosition:word.start toPosition:word.end];

    // Set the selected range to highlight the word
    [_backedTextInputView setSelectedRange:NSMakeRange(location, length)];
    [self _handleGesture];
}


-(void) handleLongPress: (UILongPressGestureRecognizer *) gesture
{
    CGPoint pos = [gesture locationInView:_backedTextInputView];
    pos.y += _backedTextInputView.contentOffset.y;

    UITextPosition *tapPos = [_backedTextInputView closestPositionToPoint:pos];
    UITextRange *word = [_backedTextInputView.tokenizer rangeEnclosingPosition:tapPos withGranularity:(UITextGranularityWord) inDirection:UITextWritingDirectionNatural];

    switch ([gesture state]) {
        case UIGestureRecognizerStateBegan:
            if (_backedTextInputView.selectedTextRange != nil) return;
            selectionStart = word.start;
            break;
        case UIGestureRecognizerStateChanged:
            break;
        case UIGestureRecognizerStateEnded:
            selectionStart = nil;
            [self _handleGesture];
            return;

        default:
            break;
    }

    UITextPosition *selectionEnd = word.end;

    NSInteger location = [_backedTextInputView offsetFromPosition:beginning toPosition:selectionStart];
    NSInteger endLocation = [_backedTextInputView offsetFromPosition:beginning toPosition:selectionEnd];

    // Ensure that location is not greater than endLocation
    if (location > endLocation) {
        NSInteger temp = location;
        location = endLocation;
        endLocation = temp;
    }
    if (location == 0 && endLocation == 0) return;

    [_backedTextInputView select:self];
    [_backedTextInputView setSelectedRange:NSMakeRange(location, endLocation - location)];

}

-(void) handleTap: (UITapGestureRecognizer *) gesture
{
    [_backedTextInputView select:self];
    [_backedTextInputView selectAll:self];
    [self _handleGesture];
}

- (void)setAttributedText:(NSAttributedString *)attributedText
{
    if (self.value) {
        NSAttributedString *str = [[NSAttributedString alloc] initWithString:self.value attributes:self.textAttributes.effectiveTextAttributes];

        [super setAttributedText:str];
    } else {
        [super setAttributedText:attributedText];
    }
}

- (id<RCTBackedTextInputViewProtocol>)backedTextInputView
{
    return _backedTextInputView;
}

- (void)tappedMenuItem:(NSString *)eventType
{
    RCTTextSelection *selection = self.selection;

    NSUInteger start = selection.start;
    NSUInteger end = selection.end - selection.start;

    self.onSelection(@{
        @"content": [[self.attributedText string] substringWithRange:NSMakeRange(start, end)],
        @"eventType": eventType,
        @"selectionStart": @(start),
        @"selectionEnd": @(selection.end)
    });

    [_backedTextInputView setSelectedTextRange:nil notifyDelegate:false];
}

- (NSMethodSignature *)methodSignatureForSelector:(SEL)sel
{
    if ([super methodSignatureForSelector:sel]) {
        return [super methodSignatureForSelector:sel];
    }
    return [super methodSignatureForSelector:@selector(tappedMenuItem:)];
}

- (void)forwardInvocation:(NSInvocation *)invocation
{
    NSString *sel = NSStringFromSelector([invocation selector]);
    NSRange match = [sel rangeOfString:SELECTOR_CUSTOM];
    if (match.location == 0) {
        [self tappedMenuItem:[sel substringFromIndex:17]];
    } else {
        [super forwardInvocation:invocation];
    }
}

- (BOOL)canBecomeFirstResponder
{
    return YES;
}

- (BOOL)canPerformAction:(SEL)action withSender:(id)sender
{
    if(selectionStart != nil) {return NO;}
    NSString *sel = NSStringFromSelector(action);
    NSRange match = [sel rangeOfString:SELECTOR_CUSTOM];

    if (match.location == 0) {
        return YES;
    }
    return NO;
}

- (UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event {
    UIView *hitView = [super hitTest:point withEvent:event];

    // Check if the hit view is not part of the text view's hierarchy
    if (![_backedTextInputView isDescendantOfView:hitView]) {
        // If the text view is the first responder and the tap is outside, consider clearing the selection
        if (_backedTextInputView.isFirstResponder) {
            [_backedTextInputView setSelectedTextRange:nil notifyDelegate:true];
        }
    }

    return hitView;
}

@end

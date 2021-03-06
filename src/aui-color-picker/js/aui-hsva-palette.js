/**
 * The Color Picker Component
 *
 * @module aui-color-picker
 * @submodule aui-hsva-palette
 */

var Lang = A.Lang,
    AColor = A.Color,
    ADo = A.Do,
    AWidget = A.Widget,

    NAME = 'hsva-palette',

    getClassName = A.getClassName,

    _DOT = '.',
    _EMPTY = '',
    _POUND = '#',
    _SPACE = ' ',

    BACKGROUND_COLOR = 'backgroundColor',
    COLOR_TYPE_HSVA = 'HSVA',
    COLOR_TYPE_RGBA = 'RGBA',
    CONTENT_BOX = 'contentBox',
    CONTROLS = 'controls',
    DEFAULT_HEX_VALUE = 'ff0000ff',
    DEFAULT_RGBA_COLOR = 'rgb(255, 0, 0, 0)',
    HS_THUMB_CHANGE = 'hsThumbChange',
    HSVA_INPUT_CHANGE = 'hsvaInputChange',
    LENGTH = 'length',
    OFFSET_HEIGHT = 'offsetHeight',
    OPACITY = 'opacity',
    OUT_TYPE_HEX = 'Hex',
    PREFIX_ALPHA = '0',
    RAIL_MOUSEDOWN = 'railMouseDown',
    RGB_INPUT_CHANGE = 'rgbInputChange',
    SLIDE_START = 'slideStart',
    STRINGS = 'strings',
    TO = 'to',
    VALUE = 'value',
    VALUE_CHANGE = 'valueChange',

    MIN_ALPHA = 0,

    MAX_ALPHA = 255,
    MAX_HUE = 360,
    MAX_SATURATION = 100,
    MAX_VALUE = 100,

    MAXLEN_HEX = 8,

    PADDING_HEX_LEN_3 = 'fffff',
    PADDING_HEX_LEN_6 = 'ff',

    SUFFIX_HEX = '-hex',
    SUFFIX_ALPHA = '-a',

    TYPE_ALPHA = 'alpha',
    TYPE_HEX = 'hex',

    CSS_CONTAINER_ALPHA = getClassName('hsv-container-alpha'),

    CSS_ALPHA_CANVAS = getClassName('hsv-alpha-canvas'),
    CSS_ALPHA_SLIDER_CONTAINER = getClassName('hsv-alpha-slider-container'),
    CSS_ALPHA_THUMB = getClassName('hsv-alpha-thumb'),
    CSS_ALPHA_THUMB_IMAGE = getClassName('hsv-alpha-image'),

    REGEX_HEX_COLOR_ALPHA = /^([a-f0-9]{6}|[a-f0-9]{8}|[a-f0-9]{3})$/i,

    /**
     * A base class for `HSVAPalette`.
     *
     * @class A.HSVAPalette
     * @extends A.HSVPalette
     * @param {Object} config Object literal specifying widget configuration
     *      properties.
     * @constructor
     */
    HSVAPalette = A.Base.create(NAME, A.HSVPalette, [], {
        TPL_ALPHA_CANVAS: '<span class="' + CSS_ALPHA_CANVAS + '"></span>',

        TPL_ALPHA_SLIDER_CONTAINER: '<div class="' + CSS_ALPHA_SLIDER_CONTAINER + '"><div>',

        TPL_ALPHA_THUMB: '<span class="' + CSS_ALPHA_THUMB + '"><span class="' + CSS_ALPHA_THUMB_IMAGE + '"></span></span>',

        /**
         * Construction logic executed during `HSVAPalette` instantiation.
         * Lifecycle.
         *
         * @method initializer
         * @protected
         */
        initializer: function() {
            var instance = this;

            instance.set('fieldValidator.hex', REGEX_HEX_COLOR_ALPHA);

            instance.after(HS_THUMB_CHANGE, instance._afterHsThumbChangeFn, instance);
            instance.after(HSVA_INPUT_CHANGE, instance._afterHSVAInputChange, instance);
            instance.after(RGB_INPUT_CHANGE, instance._afterRGBInputChange, instance);
        },

        /**
         * Sets color after hex input `valueChange`.
         *
         * @method _afterHexInputChange
         * @param {EventFacade} event
         * @protected
         */
        _afterHexInputChange: function(event) {
            // YUI Code toHSVA from hex + alpha is broken, will remove the alpha
            // value
            var instance = this,
                hexColor = event.hexColor,
                alpha = hexColor.substr(6, 2),
                alphaDec = parseInt(alpha, 16);

            instance._alphaSlider.set(
                VALUE,
                MAX_ALPHA - alphaDec, {
                    src: AWidget.UI_SRC
                }
            );

            instance._alphaSliderContainer.setStyle(BACKGROUND_COLOR, hexColor);

            instance._resultView.setStyle(OPACITY, alphaDec / MAX_ALPHA);

            if (instance.get(CONTROLS)) {
                instance._setFieldValue(instance._aContainer, alphaDec);
            }
        },

        /**
         * Sets alpha slider container style after thumb position change.
         *
         * @method _afterHsThumbChangeFn
         * @param {EventFacade} event
         * @protected
         */
        _afterHsThumbChangeFn: function(event) {
            var instance = this;

            instance._alphaSliderContainer.setStyle(BACKGROUND_COLOR, event.hexColor);
        },

        /**
         * Sets alpha slider style, position, and results view after HSVA input
         * `valueChange`.
         *
         * @method _afterHSVAInputChange
         * @param {EventFacade} event
         * @protected
         */
        _afterHSVAInputChange: function(event) {
            var instance = this,
                alpha = instance._getFieldValue(instance._aContainer);

            instance._alphaSlider.set(
                VALUE,
                MAX_ALPHA - alpha, {
                    src: AWidget.UI_SRC
                }
            );

            instance._alphaSliderContainer.setStyle(BACKGROUND_COLOR, event.hexColor);

            instance._resultView.setStyle(OPACITY, alpha / MAX_ALPHA);
        },

        /**
         * Sets alpha slider container style after RGB input `valueChange`.
         *
         * @method _afterRGBInputChange
         * @param {EventFacade} event
         * @protected
         */
        _afterRGBInputChange: function(event) {
            var instance = this;

            instance._alphaSliderContainer.setStyle(BACKGROUND_COLOR, event.hexColor);
        },

        /**
         * Calculates and returns RGB value from array of values.
         *
         * @method _calculateRGBArray
         * @param {Number} r
         * @param {Number} g
         * @param {Number} b
         * @return {String} RGB value
         * @protected
         */
        _calculateRGBArray: function(r, g, b) {
            var instance = this,
                alpha;

            alpha = 255 - instance._alphaSlider.get(VALUE);

            return AColor.fromArray([r, g, b, alpha], COLOR_TYPE_RGBA);
        },

        /**
         * Calculates and returns RGB color value.
         *
         * @method _calculateRGBColor
         * @param {Number} hue
         * @param {Number} saturation
         * @param {Number} value
         * @return {String} RGB value
         * @protected
         */
        _calculateRGBColor: function(hue, saturation, value) {
            var instance = this,
                alpha = 255 - instance._alphaSlider.get(VALUE);

            return instance._calculateRGBA(hue, saturation, value, alpha);
        },

        /**
         * Calculates RGB color value from HSVA color value.
         *
         * @method _calculateRGBA
         * @param {Number} hue
         * @param {Number} saturation
         * @param {Number} value
         * @param {Number} alpha
         * @return {String} RGB value
         * @protected
         */
        _calculateRGBA: function(hue, saturation, value, alpha) {
            var rgbColor = DEFAULT_RGBA_COLOR,
                hsvColor,
                tmp;

            if (hue !== MAX_HUE || Lang.toInt(saturation) !== MAX_SATURATION || Lang.toInt(value) !== MAX_VALUE) {
                hsvColor = 'hsva(' + (hue === MAX_HUE ? MAX_HUE - 1 : hue) + ', ' + saturation + '%, ' + value +
                    '%, ' + alpha + ')';

                rgbColor = AColor.toRGBA(hsvColor);

                // fix YUI bug on getting alpha - if it is 0, they return 1
                if (Lang.toInt(alpha) === 0) {
                    tmp = AColor.toArray(rgbColor);

                    tmp[3] = PREFIX_ALPHA;

                    rgbColor = AColor.fromArray(tmp, COLOR_TYPE_RGBA);
                }
            }

            return rgbColor;
        },

        /**
         * Converts one color value type to another.
         *
         * @method _convertColor
         * @param {String} color value
         * @param {String} from type
         * @param {String} to type
         * @return {String} converted color value
         * @protected
         */
        _convertColor: function(value, from, to) {
            var instance = this,
                out,
                outputHex;

            outputHex = (to === TYPE_HEX);

            if (from === TYPE_HEX) {
                value = _POUND + value;
            }

            if (outputHex) {
                to = OUT_TYPE_HEX;
            }
            else {
                to = (to + 'a').toUpperCase();
            }

            out = AColor[TO + to](value);

            if (outputHex) {
                out = out.substr(1);
            }

            return out;
        },

        /**
         * Returns container class name.
         *
         * @method _getContainerClassName
         * @return {String} class name
         * @protected
         */
        _getContainerClassName: function() {
            var instance = this,
                className;

            className = A.HSVAPalette.superclass._getContainerClassName.call(instance);

            className += _SPACE + CSS_CONTAINER_ALPHA;

            return className;
        },

        /**
         * Returns hexadecimal color value.
         *
         * @method _getHexValue
         * @param {String} hexColor
         * @param {Array} rgbColorArray
         * @return {String} hex value
         * @protected
         */
        _getHexValue: function(hexColor, rgbColorArray) {
            // YUI doesn't have toRGBA method, we have to add alpha explicitly
            var alpha,
                result;

            alpha = parseInt(rgbColorArray[3], 10).toString(16);

            if (alpha.length === 1) {
                alpha = PREFIX_ALPHA + alpha;
            }

            result = hexColor + alpha;

            return result.substring(1);
        },

        /**
         * Returns HSV color values.
         *
         * @method _getHSVArray
         * @param {Number} hsv
         * @return {Array} hsv color array
         * @protected
         */
        _getHSVArray: function(hsv) {
            var instance = this;

            return AColor.toArray(hsv, COLOR_TYPE_HSVA);
        },

        /**
         * Renders alpha slider and binds events.
         *
         * @method _createAlphaSlider
         * @protected
         */
        _createAlphaSlider: function() {
            var instance = this,
                alphaThumbHeight,
                contentBox,
                slider;

            contentBox = instance.get(CONTENT_BOX),

            slider = new A.Slider({
                axis: 'y',
                min: MIN_ALPHA,
                max: MAX_ALPHA
            });

            slider.RAIL_TEMPLATE = instance.TPL_ALPHA_CANVAS;
            slider.THUMB_TEMPLATE = instance.TPL_ALPHA_THUMB;

            slider.render(instance._alphaSliderContainer);

            alphaThumbHeight = contentBox.one(_DOT + CSS_ALPHA_THUMB_IMAGE).get(OFFSET_HEIGHT);

            slider.set(
                LENGTH,
                instance._alphaSliderContainer.get(OFFSET_HEIGHT) + (alphaThumbHeight / 2)
            );

            slider.on([SLIDE_START, RAIL_MOUSEDOWN], instance._setHSContainerXY, instance);

            slider.on(VALUE_CHANGE, instance._onAlphaChange, instance);

            instance._alphaSlider = slider;
        },

        /**
         * Creates sliders.
         *
         * @method _createSliders
         * @protected
         */
        _createSliders: function() {
            var instance = this;

            A.HSVAPalette.superclass._createSliders.call(instance);

            instance._createAlphaSlider();
        },

        /**
         * Returns hex container configuration.
         *
         * @method _getHexContainerConfig
         * @return {Object} hex container config object
         * @protected
         */
        _getHexContainerConfig: function() {
            var instance = this;

            return {
                label: instance.get(STRINGS).hex,
                maxlength: MAXLEN_HEX,
                suffix: SUFFIX_HEX,
                type: TYPE_HEX,
                unit: _EMPTY,
                value: DEFAULT_HEX_VALUE
            };
        },

        /**
         * Formats hexadecimal color values.
         *
         * @method _normalizeHexValue
         * @param {String} hex
         * @return {String} formatted hex color value
         * @protected
         */
        _normalizeHexValue: function(hex) {
            var padding = '';

            if (hex.length === 3) {
                padding = PADDING_HEX_LEN_3;
            }
            else if (hex.length === 6) {
                padding = PADDING_HEX_LEN_6;
            }

            return (hex += padding);
        },

        /**
         * Syncs `HSVAPalette` UI on alpha `valueChange`.
         *
         * @method _onAlphaChange
         * @param {EventFacade} event
         * @protected
         */
        _onAlphaChange: function(event) {
            var instance = this,
                alpha,
                thumbXY,
                x,
                y,
                hue,
                saturation,
                value,
                rgbColor,
                rgbColorArray,
                hexValue;

            if (event.src !== AWidget.UI_SRC) {
                alpha = event.newVal;

                instance._resultView.setStyle(OPACITY, 1 - (alpha / MAX_ALPHA));

                thumbXY = instance._colorThumb.getXY();

                x = (thumbXY[0] - instance._hsContainerXY[0] + instance._colorThumbGutter);
                y = (thumbXY[1] - instance._hsContainerXY[1] + instance._colorThumbGutter);

                hue = instance._calculateHue(x);
                saturation = instance._calculateSaturation(y);
                value = MAX_VALUE - instance._valueSlider.get(VALUE);

                rgbColor = instance._calculateRGBA(hue, saturation, value, MAX_ALPHA - alpha);
                rgbColorArray = AColor.toArray(rgbColor);
                hexValue = instance._getHexValue(AColor.toHex(rgbColor), rgbColorArray);

                instance._setFieldValue(instance._outputContainer, hexValue);

                if (instance.get(CONTROLS)) {
                    instance._setFieldValue(instance._aContainer, MAX_ALPHA - alpha);
                    instance._setFieldValue(instance._rContainer, rgbColorArray[0]);
                    instance._setFieldValue(instance._gContainer, rgbColorArray[1]);
                    instance._setFieldValue(instance._bContainer, rgbColorArray[2]);
                }
            }
        },

        /**
         * Renders alpha slider container.
         *
         * @method _renderAlphaSliderContainer
         * @protected
         */
        _renderAlphaSliderContainer: function() {
            var instance = this;

            instance._alphaSliderContainer = instance._viewContainer.appendChild(
                instance.TPL_ALPHA_SLIDER_CONTAINER
            );
        },

        /**
         * Renders alpha field.
         *
         * @method _renderFields
         * @protected
         */
        _renderFields: function() {
            var instance = this;

            A.HSVAPalette.superclass._renderFields.call(instance);

            instance._aContainer = instance._renderField(
                instance._labelValueHSVContainer, {
                    label: instance.get(STRINGS).a,
                    maxlength: 3,
                    suffix: SUFFIX_ALPHA,
                    type: TYPE_ALPHA,
                    unit: _EMPTY,
                    value: MAX_ALPHA
                }
            );
        },

        /**
         * Renders view container content.
         *
         * @method _renderViewContainerContent
         * @protected
         */
        _renderViewContainerContent: function() {
            var instance = this;

            A.HSVAPalette.superclass._renderViewContainerContent.call(instance);

            instance._renderAlphaSliderContainer();
        }
    }, {

        /**
         * Static property provides a string to identify the class.
         *
         * @property NAME
         * @type {String}
         * @static
         */
        NAME: NAME,

        /**
         * Static property provides a string to identify the namespace.
         *
         * @property NS
         * @type {String}
         * @static
         */
        NS: NAME
    });

A.HSVAPalette = HSVAPalette;

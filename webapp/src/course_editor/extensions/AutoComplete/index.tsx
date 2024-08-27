import { Node } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { DOMParser as TTDOMParser } from '@tiptap/pm/model';
import { apiClient } from '@/lib/api-client';

function debounce<T extends (...args: any[]) => any>(
    callback: T,
    delay: number,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    let timer: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
        return new Promise((resolve, reject) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                try {
                    const output = callback(...args);
                    resolve(output);
                } catch (err) {
                    reject(err);
                }
            }, delay);
        });
    };
}

export const AutocompleteExtension = Node.create<{
    applySuggestionKeys: string[];
    suggestionDebounce: number;
    getSuggestions: (previousText: string) => Promise<string | null>;
}>({
    name: 'suggestion',

    addOptions() {
        return {
            applySuggestionKeys: ['Tab', 'ArrowRight'],
            suggestionDebounce: 1000,
            previousTextLength: 1000,
            getSuggestions: async () => null,
        };
    },

    addProseMirrorPlugins() {
        const pluginKey = new PluginKey<{ decorations: DecorationSet; suggestion: string | null }>('suggestion');

        const getSuggestion = debounce(async (previousText: string, cb: (suggestion: string | null) => void) => {
            apiClient.autoComplete(previousText).then(completion => cb(completion))
        }, this.options.suggestionDebounce);

        const { applySuggestionKeys } = this.options;

        return [
            new Plugin({
                key: pluginKey,
                state: {
                    init() {
                        return {
                            decorations: DecorationSet.empty,
                            suggestion: null,
                        };
                    },
                    apply(tr, oldValue) {
                        if (tr.getMeta(pluginKey)) {
                            // Update the decoration state based on the async data
                            const { decorations, suggestion } = tr.getMeta(pluginKey);
                            return {
                                decorations,
                                suggestion,
                            };
                        }
                        return tr.docChanged
                            ? {
                                decorations: oldValue.decorations.map(tr.mapping, tr.doc),
                                suggestion: oldValue.suggestion,
                            }
                            : oldValue;
                    },
                },
                view() {
                    return {
                        update(view, prevState) {
                            // This will add the widget decoration at the cursor position
                            const selection = view.state.selection;
                            const cursorPos = selection.$head.pos;
                            const nextNode = view.state.doc.nodeAt(cursorPos);

                            // If the cursor is not at the end of the block and we have a suggestion => hide the suggestion
                            if (nextNode && !nextNode.isBlock && pluginKey.getState(view.state)?.suggestion !== null) {
                                const tr = view.state.tr;
                                tr.setMeta('addToHistory', false);
                                tr.setMeta(pluginKey, { suggestion: null, decorations: DecorationSet.empty });
                                view.dispatch(tr);
                                return;
                            }

                            // If the document didn't change, do nothing
                            if (prevState && prevState.doc.eq(view.state.doc)) {
                                return;
                            }

                            // reset the suggestion before fetching a new one
                            setTimeout(() => {
                                const tr = view.state.tr;
                                tr.setMeta('addToHistory', false);
                                tr.setMeta(pluginKey, { suggestion: null, decorations: DecorationSet.empty });
                                view.dispatch(tr);
                            }, 0);

                            // fetch a new suggestion

                            const updateSuggestion = (suggestion: string) => {
                                const updatedState = view.state;

                                const cursorPos = updatedState.selection.$head.pos;
                                const suggestionDecoration = Decoration.widget(
                                    cursorPos,
                                    () => {
                                        const parentNode = document.createElement('span');
                                        const addSpace = nextNode && nextNode.isText ? ' ' : '';
                                        parentNode.innerHTML = `${addSpace}${suggestion}`;
                                        parentNode.classList.add('autocomplete-suggestion');
                                        return parentNode;
                                    },
                                    { side: 1 },
                                );

                                const decorations = DecorationSet.create(updatedState.doc, [suggestionDecoration]);
                                const tr = view.state.tr;
                                tr.setMeta('addToHistory', false);
                                tr.setMeta(pluginKey, { suggestion, decorations });
                                view.dispatch(tr);

                            }

                            const { $from } = view.state.selection
                            const lineStart = $from.start()
                            const currentLineText = view.state.doc.textBetween(lineStart, $from.pos, '\n', '\0')
                            const previousText = view.state.doc.textBetween(0, $from.pos, '\n', '\0');
                            console.log("currentLineText", currentLineText.length, currentLineText)
                            console.log("previousText", previousText.length, previousText)
                            if (currentLineText.length < 10 || currentLineText.charAt(currentLineText.length - 1) !== ' ') return;
                            getSuggestion(previousText, (suggestion) => {
                                if (!suggestion) return;
                                let currentSuggestion = "";
                                const animateSuggestion = (fullSuggestion: string, index = 0) => {
                                    if (index <= fullSuggestion.length) {
                                        currentSuggestion = fullSuggestion.slice(0, index);
                                        updateSuggestion(currentSuggestion);
                                        setTimeout(() => animateSuggestion(fullSuggestion, index + 1), 5);
                                    }
                                };
                                animateSuggestion(suggestion);
                            });
                        },
                    };
                },
                props: {
                    decorations(editorState) {
                        return pluginKey.getState(editorState)?.decorations;
                    },
                    handleKeyDown(view, event) {
                        const suggestion = pluginKey.getState(view.state)?.suggestion;
                        if (!suggestion) {
                            return false;
                        }

                        if (applySuggestionKeys.includes(event.key)) {
                            event.preventDefault();
                            const { state } = view;
                            const { tr } = state;
                            const pos = state.selection.from;

                            // Create a temporary document to parse the HTML
                            const tempDoc = document.implementation.createHTMLDocument();
                            tempDoc.body.innerHTML = suggestion;

                            // Parse the HTML into a ProseMirror Node
                            const parser = TTDOMParser.fromSchema(state.schema);
                            const fragment = parser.parseSlice(tempDoc.body, {
                                context: state.doc.resolve(pos),
                                preserveWhitespace: false,
                            }).content;

                            // Insert the parsed content at the cursor position
                            tr.insert(pos, fragment);
                            view.dispatch(tr);

                            return true;
                        }


                        if (event.key === 'Escape') {
                            const tr = view.state.tr;
                            tr.setMeta('addToHistory', false);
                            tr.setMeta(pluginKey, { suggestion: null, decorations: DecorationSet.empty });
                            view.dispatch(tr);
                            return true;
                        }

                        return false;
                    },
                },
            }),
        ];
    },
});
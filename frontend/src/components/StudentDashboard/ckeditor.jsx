import { useState, useEffect, useRef, useMemo } from 'react'
import { FaArrowLeft, FaSave, FaEdit, FaCheckCircle } from "react-icons/fa";
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';
import axios from 'axios';
import toast from 'react-hot-toast';

import '../../App.css';

const LICENSE_KEY = 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3Njc5MTY3OTksImp0aSI6IjEyZDJkOWY2LTQ2ZWYtNDNlZC1hYWI4LTc0M2U3YzQ1NmI3MyIsImxpY2Vuc2VkSG9zdHMiOlsiMTI3LjAuMC4xIiwibG9jYWxob3N0IiwiMTkyLjE2OC4qLioiLCIxMC4qLiouKiIsIjE3Mi4qLiouKiIsIioudGVzdCIsIioubG9jYWxob3N0IiwiKi5sb2NhbCJdLCJ1c2FnZUVuZHBvaW50IjoiaHR0cHM6Ly9wcm94eS1ldmVudC5ja2VkaXRvci5jb20iLCJkaXN0cmlidXRpb25DaGFubmVsIjpbImNsb3VkIiwiZHJ1cGFsIl0sImxpY2Vuc2VUeXBlIjoiZGV2ZWxvcG1lbnQiLCJmZWF0dXJlcyI6WyJEUlVQIl0sInZjIjoiYzk3MWViZjUifQ.6RiV5ly5Jc1bdyk119u1ItFNWwddASCASBj43gbfiBKoT0OVY9E6GsH4Fiz0pN2YGZ5MvTx0ZX_b00cEH-e44A';

export default function Editor({experience, onClose}) {
    const editorContainerRef = useRef(null);
    const editorRef = useRef(null);
    const editorWordCountRef = useRef(null);
    const editorMenuBarRef = useRef(null);
    const [editorInstance, setEditorInstance] = useState(null);
    const [isLayoutReady, setIsLayoutReady] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const cloud = useCKEditorCloud({ version: '44.1.0' });
    const [editorData, setEditorData] = useState(experience);

    useEffect(() => {
        setIsLayoutReady(true);
        return () => setIsLayoutReady(false);
    }, []);

    const { ClassicEditor, editorConfig } = useMemo(() => {
        if (cloud.status !== 'success' || !isLayoutReady) {
            return {};
        }

        const {
            ClassicEditor,
            Alignment,
            Autoformat,
            AutoImage,
            Autosave,
            BalloonToolbar,
            BlockQuote,
            Bold,
            CloudServices,
            Essentials,
            FontBackgroundColor,
            FontColor,
            FontFamily,
            FontSize,
            GeneralHtmlSupport,
            Heading,
            Highlight,
            HorizontalLine,
            ImageBlock,
            ImageCaption,
            ImageInline,
            ImageInsertViaUrl,
            ImageResize,
            ImageStyle,
            ImageTextAlternative,
            ImageToolbar,
            ImageUpload,
            Indent,
            IndentBlock,
            Italic,
            Link,
            LinkImage,
            List,
            ListProperties,
            MediaEmbed,
            Paragraph,
            PasteFromOffice,
            SpecialCharacters,
            SpecialCharactersArrows,
            SpecialCharactersCurrency,
            SpecialCharactersEssentials,
            SpecialCharactersLatin,
            SpecialCharactersMathematical,
            SpecialCharactersText,
            Strikethrough,
            Style,
            Subscript,
            Superscript,
            Table,
            TableCaption,
            TableCellProperties,
            TableColumnResize,
            TableProperties,
            TableToolbar,
            TextPartLanguage,
            TextTransformation,
            Title,
            TodoList,
            Underline,
            WordCount
        } = cloud.CKEditor;

        return {
            ClassicEditor,
            editorConfig: {
                toolbar: {
                    items: [
                        'textPartLanguage',
                        '|',
                        'heading',
                        'style',
                        '|',
                        'fontSize',
                        'fontFamily',
                        'fontColor',
                        'fontBackgroundColor',
                        '|',
                        'bold',
                        'italic',
                        'underline',
                        'strikethrough',
                        'subscript',
                        'superscript',
                        '|',
                        'specialCharacters',
                        'horizontalLine',
                        'link',
                        'insertImageViaUrl',
                        'mediaEmbed',
                        'insertTable',
                        'highlight',
                        'blockQuote',
                        '|',
                        'alignment',
                        '|',
                        'bulletedList',
                        'numberedList',
                        'todoList',
                        'outdent',
                        'indent'
                    ],
                    shouldNotGroupWhenFull: true
                },
                plugins: [
                    Alignment,
                    Autoformat,
                    AutoImage,
                    Autosave,
                    BalloonToolbar,
                    BlockQuote,
                    Bold,
                    CloudServices,
                    Essentials,
                    FontBackgroundColor,
                    FontColor,
                    FontFamily,
                    FontSize,
                    GeneralHtmlSupport,
                    Heading,
                    Highlight,
                    HorizontalLine,
                    ImageBlock,
                    ImageCaption,
                    ImageInline,
                    ImageInsertViaUrl,
                    ImageResize,
                    ImageStyle,
                    ImageTextAlternative,
                    ImageToolbar,
                    ImageUpload,
                    Indent,
                    IndentBlock,
                    Italic,
                    Link,
                    LinkImage,
                    List,
                    ListProperties,
                    MediaEmbed,
                    Paragraph,
                    PasteFromOffice,
                    SpecialCharacters,
                    SpecialCharactersArrows,
                    SpecialCharactersCurrency,
                    SpecialCharactersEssentials,
                    SpecialCharactersLatin,
                    SpecialCharactersMathematical,
                    SpecialCharactersText,
                    Strikethrough,
                    Style,
                    Subscript,
                    Superscript,
                    Table,
                    TableCaption,
                    TableCellProperties,
                    TableColumnResize,
                    TableProperties,
                    TableToolbar,
                    TextPartLanguage,
                    TextTransformation,
                    Title,
                    TodoList,
                    Underline,
                    WordCount
                ],
                balloonToolbar: ['bold', 'italic', '|', 'link', '|', 'bulletedList', 'numberedList'],
                fontFamily: {
                    supportAllValues: true
                },
                fontSize: {
                    options: [10, 12, 14, 'default', 18, 20, 22],
                    supportAllValues: true
                },
                heading: {
                    options: [
                        {
                            model: 'paragraph',
                            title: 'Paragraph',
                            class: 'ck-heading_paragraph'
                        },
                        {
                            model: 'heading1',
                            view: 'h1',
                            title: 'Heading 1',
                            class: 'ck-heading_heading1'
                        },
                        {
                            model: 'heading2',
                            view: 'h2',
                            title: 'Heading 2',
                            class: 'ck-heading_heading2'
                        },
                        {
                            model: 'heading3',
                            view: 'h3',
                            title: 'Heading 3',
                            class: 'ck-heading_heading3'
                        },
                        {
                            model: 'heading4',
                            view: 'h4',
                            title: 'Heading 4',
                            class: 'ck-heading_heading4'
                        },
                        {
                            model: 'heading5',
                            view: 'h5',
                            title: 'Heading 5',
                            class: 'ck-heading_heading5'
                        },
                        {
                            model: 'heading6',
                            view: 'h6',
                            title: 'Heading 6',
                            class: 'ck-heading_heading6'
                        }
                    ]
                },
                htmlSupport: {
                    allow: [
                        {
                            name: /^.*$/,
                            styles: true,
                            attributes: true,
                            classes: true
                        }
                    ]
                },
                image: {
                    toolbar: [
                        'toggleImageCaption',
                        'imageTextAlternative',
                        '|',
                        'imageStyle:inline',
                        'imageStyle:wrapText',
                        'imageStyle:breakText',
                        '|',
                        'resizeImage'
                    ]
                },
                initialData: editorData ? `<h1>${editorData.title}</h1>${editorData.content}` : '<h2>Write Title Here..</h2>',
                licenseKey: LICENSE_KEY,
                link: {
                    addTargetToExternalLinks: true,
                    defaultProtocol: 'https://',
                    decorators: {
                        toggleDownloadable: {
                            mode: 'manual',
                            label: 'Downloadable',
                            attributes: {
                                download: 'file'
                            }
                        }
                    }
                },
                list: {
                    properties: {
                        styles: true,
                        startIndex: true,
                        reversed: true
                    }
                },
                menuBar: {
                    isVisible: true
                },
                placeholder: 'Type or paste your content here!',
                style: {
                    definitions: [
                        {
                            name: 'Article category',
                            element: 'h3',
                            classes: ['category']
                        },
                        {
                            name: 'Title',
                            element: 'h2',
                            classes: ['document-title']
                        },
                        {
                            name: 'Subtitle',
                            element: 'h3',
                            classes: ['document-subtitle']
                        },
                        {
                            name: 'Info box',
                            element: 'p',
                            classes: ['info-box']
                        },
                        {
                            name: 'Side quote',
                            element: 'blockquote',
                            classes: ['side-quote']
                        },
                        {
                            name: 'Marker',
                            element: 'span',
                            classes: ['marker']
                        },
                        {
                            name: 'Spoiler',
                            element: 'span',
                            classes: ['spoiler']
                        },
                        {
                            name: 'Code (dark)',
                            element: 'pre',
                            classes: ['fancy-code', 'fancy-code-dark']
                        },
                        {
                            name: 'Code (bright)',
                            element: 'pre',
                            classes: ['fancy-code', 'fancy-code-bright']
                        }
                    ]
                },
                table: {
                    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
                }
            }
        };
    }, [cloud, isLayoutReady]);

    const submitExperience = async (tempcontent) => {
        setIsSaving(true);
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = tempcontent;
            const titleElement = tempDiv.querySelector('h1');
            const title = titleElement ? titleElement.textContent : 'Untitled';
            if (titleElement) {
                titleElement.remove();
            }
            const content = tempDiv.innerHTML;

            const endpoint = editorData
                ? `${import.meta.env.REACT_APP_BASE_URL}/sharedexperience/${editorData?._id}`
                : `${import.meta.env.REACT_APP_BASE_URL}/sharedexperience/submit`;

            const response = await axios.post(
                endpoint,
                { title, content },
                { withCredentials: true }
            );
            toast.success(editorData ? 'Experience updated successfully!' : 'Experience submitted successfully!');
            setTimeout(() => onClose(), 500);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Something went wrong!');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = () => {
        if (editorInstance) {
            const content = editorInstance.getData();
            submitExperience(content);
        } else {
            console.error('Editor instance not available');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-2 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 ">
                    
                    {/* <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
                        <div className="flex items-center space-x-4 mb-4">
                                <FaEdit className="text-custom-blue text-3xl" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">
                                    {editorData ? 'Edit Your Experience' : 'Share Your Placement Journey'}
                                </h1>
                                <p className="text-gray-600 text-xs mt-1">
                                    Help future students by sharing your insights and experiences
                                </p>
                            </div>
                        </div>
                    </div> */}
                                    {/* Tips Section */}
                <div className="mt-1 bg-white rounded-2xl shadow-md p-6 border border-gray-100 animate-fadeIn">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">💡</span>
                        Tips for Writing a Great Experience
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                            <h4 className="font-semibold text-gray-800 mb-2">Be Detailed</h4>
                            <p className="text-sm text-gray-600">Share specific details about the interview process, questions asked, and preparation strategies.</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                            <h4 className="font-semibold text-gray-800 mb-2">Be Honest</h4>
                            <p className="text-sm text-gray-600">Include both challenges you faced and how you overcame them to help others learn.</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-xl border border-green-100">
                            <h4 className="font-semibold text-gray-800 mb-2">Be Helpful</h4>
                            <p className="text-sm text-gray-600">Provide actionable advice and resources that helped you succeed in your journey.</p>
                        </div>
                    </div>
                </div>
                </div>

                {/* Editor Container */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
                    <div 
                        className="editor-container editor-container_classic-editor editor-container_include-style editor-container_include-word-count p-6"
                        ref={editorContainerRef}
                    >
                        <div className="editor-container__editor">
                            <div ref={editorRef}>
                                {ClassicEditor && editorConfig && (
                                    <CKEditor
                                        onReady={editor => {
                                            setEditorInstance(editor);
                                            const wordCount = editor.plugins.get('WordCount');
                                            editorWordCountRef.current.appendChild(wordCount.wordCountContainer);
                                            editorMenuBarRef.current.appendChild(editor.ui.view.menuBarView.element);
                                        }}
                                        onAfterDestroy={() => {
                                            setEditorInstance(null);
                                            Array.from(editorWordCountRef.current?.children || []).forEach(child => child.remove());
                                            Array.from(editorMenuBarRef.current?.children || []).forEach(child => child.remove());
                                        }}
                                        editor={ClassicEditor}
                                        config={editorConfig}
                                    />
                                )}
                            </div>
                        </div>
                        
                        {/* Word Count with enhanced styling */}
                        <div className="editor-container__word-count mt-4 px-4 py-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200" ref={editorWordCountRef}></div>
                        <div className="editor-container__menu-bar" ref={editorMenuBarRef}></div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-t border-gray-200">
                        <div className="flex items-center justify-end">
                            
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 text-gray-700 font-medium rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 border border-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="group relative px-8 py-3 bg-custom-blue text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center space-x-2">
                                        {isSaving ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaSave className="group-hover:rotate-12 transition-transform duration-300" />
                                                <span>{editorData ? 'Update Experience' : 'Publish Experience'}</span>
                                            </>
                                        )}
                                    </span>
                                    <div className="absolute inset-0 bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
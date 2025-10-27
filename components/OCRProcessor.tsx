
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ProviderForOcr } from '../types';
import { extractProviderInfo, OcrEngine, extractRawText } from '../services/geminiService';
import { ChevronLeft, UploadCloud, Check, X, Loader2, Camera, Sparkles, Cpu, Copy } from 'lucide-react';
import TagInput from './TagInput';

interface OCRProcessorProps {
    onBack: () => void;
    onProcess: (providers: ProviderForOcr[]) => void;
    availableSpecialties: string[];
}

type OcrMethod = 'gemini' | 'google-lens' | 'gemini-nano';
type GeminiNanoMode = 'structured' | 'rawText';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const capitalizeName = (name: string): string => {
    return name.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase());
};

const formatPhoneNumber = (phone: string): string => {
    let digits = phone.replace(/\D/g, '');
    if (digits.length === 10 || digits.length === 11) { // has DDD
        // do nothing for now
    } else if (digits.length === 8 || digits.length === 9) { // missing DDD
        digits = `86${digits}`; // Add default DDD
    }
    return digits;
};


const OCRProcessor: React.FC<OCRProcessorProps> = ({ onBack, onProcess, availableSpecialties }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [extractedProviders, setExtractedProviders] = useState<ProviderForOcr[]>([]);
    const [rawText, setRawText] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [ocrEngine, setOcrEngine] = useState<OcrMethod>('gemini');
    const [geminiNanoMode, setGeminiNanoMode] = useState<GeminiNanoMode>('structured'); // New state for Gemini Nano mode

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;
        const videoElement = videoRef.current;

        const startCamera = async () => {
            if (showCamera && videoElement) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                    videoElement.srcObject = stream;
                    await videoElement.play();
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    setError("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
                    setShowCamera(false);
                }
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
             if (videoElement) {
                videoElement.srcObject = null;
            }
        };
    }, [showCamera]);

    const processImage = useCallback(async (base64Image: string, mimeType: string) => {
        setIsLoading(true);
        setError(null);
        setExtractedProviders([]);
        setRawText(null);
        setImagePreview(`data:${mimeType};base64,${base64Image}`);

        try {
            if (ocrEngine === 'gemini-nano') {
                if (geminiNanoMode === 'rawText') {
                    const text = await extractRawText(base64Image, mimeType);
                    setRawText(text);
                } else { // 'structured' mode for Gemini Nano
                    const providersFromAI = await extractProviderInfo(base64Image, mimeType, 'gemini-nano', availableSpecialties);
                    const processedProviders: ProviderForOcr[] = providersFromAI.map(p => {
                        const sanitized: ProviderForOcr = {
                            name: p.name ? capitalizeName(p.name) : 'Nome não encontrado',
                            specialties: Array.isArray(p.specialties) ? p.specialties.filter(s => typeof s === 'string' && availableSpecialties.includes(s)) : [],
                            contacts: Array.isArray(p.contacts) 
                                ? p.contacts.map(c => ({
                                    id: `contact-${Date.now()}-${Math.random()}`,
                                    type: typeof c.type === 'string' ? c.type : 'Celular',
                                    value: typeof c.value === 'string' ? formatPhoneNumber(c.value) : ''
                                  }))
                                : [],
                            emails: Array.isArray(p.emails) 
                                ? p.emails.map(e => ({
                                    id: `email-${Date.now()}-${Math.random()}`,
                                    tag: typeof e.tag === 'string' ? e.tag : 'Principal',
                                    value: typeof e.value === 'string' ? e.value : ''
                                  })) 
                                : [],
                            customTags: Array.isArray(p.customTags) ? p.customTags.filter(t => typeof t === 'string') : [],
                            address: typeof p.address === 'string' ? p.address : '',
                            googleMapsUrl: typeof p.googleMapsUrl === 'string' ? p.googleMapsUrl : '',
                            website: typeof p.website === 'string' ? p.website : '',
                            socialMedia: typeof p.socialMedia === 'object' && p.socialMedia !== null ? p.socialMedia : {},
                        };
                        return sanitized;
                    });
                    setExtractedProviders(processedProviders);
                }
            } else { // 'gemini' or 'google-lens'
                 const providersFromAI = await extractProviderInfo(base64Image, mimeType, ocrEngine, availableSpecialties);
            
                 const processedProviders: ProviderForOcr[] = providersFromAI.map(p => {
                    const sanitized: ProviderForOcr = {
                        name: p.name ? capitalizeName(p.name) : 'Nome não encontrado',
                        specialties: Array.isArray(p.specialties) ? p.specialties.filter(s => typeof s === 'string' && availableSpecialties.includes(s)) : [],
                        contacts: Array.isArray(p.contacts) 
                            ? p.contacts.map(c => ({
                                id: `contact-${Date.now()}-${Math.random()}`,
                                type: typeof c.type === 'string' ? c.type : 'Celular',
                                value: typeof c.value === 'string' ? formatPhoneNumber(c.value) : ''
                              }))
                            : [],
                        emails: Array.isArray(p.emails) 
                            ? p.emails.map(e => ({
                                id: `email-${Date.now()}-${Math.random()}`,
                                tag: typeof e.tag === 'string' ? e.tag : 'Principal',
                                value: typeof e.value === 'string' ? e.value : ''
                              })) 
                            : [],
                        customTags: Array.isArray(p.customTags) ? p.customTags.filter(t => typeof t === 'string') : [],
                        address: typeof p.address === 'string' ? p.address : '',
                        googleMapsUrl: typeof p.googleMapsUrl === 'string' ? p.googleMapsUrl : '',
                        website: typeof p.website === 'string' ? p.website : '',
                        socialMedia: typeof p.socialMedia === 'object' && p.socialMedia !== null ? p.socialMedia : {},
                    };
                    return sanitized;
                });
                
                setExtractedProviders(processedProviders);
            }
        } catch (err) {
            console.error("OCR Error:", err);
            setError("Falha ao processar a imagem. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    }, [availableSpecialties, ocrEngine, geminiNanoMode]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        event.target.value = ''; // Reset file input
        const base64Image = await fileToBase64(file);
        await processImage(base64Image, file.type);
    };

    const openCamera = () => {
        setShowCamera(true);
        setError(null);
        setImagePreview(null);
        setExtractedProviders([]);
        setRawText(null);
    };

    const closeCamera = useCallback(() => {
        setShowCamera(false);
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
                processImage(base64Image, 'image/jpeg');
            }
        }
        closeCamera();
    };
    
    const handleApproveAll = () => {
        onProcess(extractedProviders);
    };

    const handleProviderChange = <K extends keyof ProviderForOcr>(index: number, field: K, value: ProviderForOcr[K]) => {
        const newProviders = [...extractedProviders];
        newProviders[index] = { ...newProviders[index], [field]: value };
        setExtractedProviders(newProviders);
    };
    
    const handleCopyRawText = () => {
        if(rawText) {
            navigator.clipboard.writeText(rawText);
            alert("Texto copiado para a área de transferência!");
        }
    }


    return (
        <div className="p-4">
            {showCamera && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
                    <video ref={videoRef} autoPlay playsInline className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <div className="absolute bottom-8 flex items-center space-x-8">
                         <button onClick={closeCamera} className="p-4 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
                            <X className="w-6 h-6"/>
                        </button>
                        <button onClick={handleCapture} className="p-6 bg-primary text-white rounded-full hover:bg-dark transition-colors shadow-lg">
                            <Camera className="w-8 h-8"/>
                        </button>
                         <div className="w-14 h-14"></div> {/* Placeholder to balance the capture button */}
                    </div>
                </div>
            )}
             <div className="relative flex items-center justify-center mb-6">
                <button onClick={onBack} className="absolute left-0 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ChevronLeft className="w-6 h-6 text-primary dark:text-accent" />
                </button>
                <h1 className="text-base font-bold text-primary dark:text-accent uppercase text-center">Extrair Contatos de Imagem</h1>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">1. Escolha o método de OCR</h3>
                     <div className="grid grid-cols-3 gap-2 p-1 rounded-lg bg-gray-200 dark:bg-gray-700">
                        <button 
                            onClick={() => setOcrEngine('gemini')} 
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${ocrEngine === 'gemini' ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            <Sparkles size={16}/> Gemini
                        </button>
                        <button 
                            onClick={() => setOcrEngine('google-lens')} 
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${ocrEngine === 'google-lens' ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            <Camera size={16}/> Google Lens
                        </button>
                        <button 
                            onClick={() => setOcrEngine('gemini-nano')}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${ocrEngine === 'gemini-nano' ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            <Cpu size={16}/> Gemini Nano
                        </button>
                    </div>
                    {ocrEngine === 'gemini-nano' && (
                        <div className="mt-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                             <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Modo Gemini Nano:</h4>
                             <div className="flex justify-center gap-2">
                                <button 
                                    onClick={() => setGeminiNanoMode('structured')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${geminiNanoMode === 'structured' ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                                >
                                    Dados Estruturados
                                </button>
                                <button 
                                    onClick={() => setGeminiNanoMode('rawText')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${geminiNanoMode === 'rawText' ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                                >
                                    Texto Bruto
                                </button>
                             </div>
                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                *O processamento de dados estruturados do Gemini Nano ainda utiliza a API em nuvem para esta aplicação web.
                             </p>
                        </div>
                    )}
                </div>

                 <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">2. Envie a imagem</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label htmlFor="ocr-upload" className="cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 h-full flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <UploadCloud className="w-12 h-12 mx-auto text-gray-400"/>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">Enviar arquivo</p>
                        </div>
                    </label>
                    <input id="ocr-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                    <button type="button" onClick={openCamera} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 h-full flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Camera className="w-12 h-12 mx-auto text-gray-400"/>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">Tirar foto</p>
                    </button>
                </div>
            </div>

            {error && <p className="mt-6 text-center text-red-500">{error}</p>}
            
            {imagePreview && (
                <div className="mt-6 relative">
                    <img src={imagePreview} alt="Preview" className={`max-w-full max-h-64 mx-auto rounded-lg shadow-md transition-all ${isLoading ? 'opacity-50 blur-sm' : ''}`} />
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 rounded-lg">
                            <Loader2 className="w-10 h-10 text-white animate-spin"/>
                            <p className="mt-3 font-semibold text-white tracking-wider">Analisando imagem com IA...</p>
                        </div>
                    )}
                </div>
            )}
            
            {rawText && !isLoading && (
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Texto Extraído (Gemini Nano - Texto Bruto)</h2>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4">
                        <textarea
                            readOnly
                            value={rawText}
                            className="w-full h-48 p-2 bg-gray-50 dark:bg-gray-700 rounded border dark:border-gray-600 font-mono text-sm"
                            aria-label="Texto extraído"
                        />
                         <button onClick={handleCopyRawText} className="flex items-center justify-center w-full px-4 py-2 bg-secondary text-white rounded-md hover:bg-dark transition-colors">
                            <Copy className="w-5 h-5 mr-2" />
                            Copiar Texto
                        </button>
                    </div>
                </div>
            )}

            {extractedProviders.length > 0 && !isLoading && (
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        {ocrEngine === 'gemini-nano' ? 'Contatos Encontrados (Gemini Nano - Dados Estruturados)' : 'Contatos Encontrados - Revise e Aprove'}
                    </h2>
                    <div className="space-y-4">
                        {extractedProviders.map((provider, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-2">
                                <input value={provider.name} onChange={(e) => handleProviderChange(index, 'name', e.target.value)} className="w-full text-lg font-bold p-1 border-b bg-transparent" placeholder="Nome do Prestador"/>
                                <textarea value={(provider.specialties || []).join(', ')} onChange={e => handleProviderChange(index, 'specialties', e.target.value.split(',').map(s=>s.trim()))} className="w-full p-1 text-sm border-b bg-transparent" placeholder="Especialidades (separadas por vírgula)"/>
                                <TagInput
                                    tags={provider.customTags || []}
                                    onTagsChange={(newTags) => handleProviderChange(index, 'customTags', newTags)}
                                    placeholder="Sub-especialidades (tags)"
                                />
                                {(provider.contacts || []).map((contact, cIndex) => (
                                    <input key={cIndex} value={contact.value} onChange={e => {
                                        const newContacts = [...(provider.contacts || [])];
                                        newContacts[cIndex] = {...newContacts[cIndex], value: e.target.value};
                                        handleProviderChange(index, 'contacts', newContacts);
                                    }} className="w-full p-1 text-sm border-b bg-transparent" placeholder="Contato"/>
                                ))}
                            </div>
                        ))}
                    </div>
                     <div className="mt-6 flex justify-end">
                        <button onClick={handleApproveAll} className="flex items-center px-6 py-2 bg-primary text-white rounded-md hover:bg-dark">
                            <Check className="w-5 h-5 mr-2"/>
                            Aprovar Todos
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OCRProcessor;

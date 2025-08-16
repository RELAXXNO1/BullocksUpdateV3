import React, { useState, useEffect } from 'react';
import { Popup } from '../../types/popup';
import { createPopup, getPopups, updatePopup, deletePopup } from '../../lib/popup';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Label } from '../ui/Label';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { Card } from '../ui/Card';
import { useToast } from '../../contexts/ToastContext';
import ImageUpload from '../ui/ImageUpload';

type FormStatePopup = Omit<Popup, 'id' | 'createdAt' | 'updatedAt' | 'userInteractions'>;

// --- Helper: PopupPreview Component ---
const PopupPreview: React.FC<{ popupState: FormStatePopup }> = ({ popupState }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const {
      title, content, imageUrl, isActive, appearance, callToAction
    } = popupState;

    const {
        backgroundColor, textColor, fontSize, borderRadius, animation
    } = appearance || {};
    const { text: buttonText, url: productUrl, backgroundColor: buttonColor } = callToAction || {};


    if (!isActive) {
        return (
            <div className="p-4 rounded-lg shadow-lg bg-gray-700 text-center text-gray-400">
                Preview is hidden because the popup is inactive.
            </div>
        );
    }

    if (isCollapsed) {
        return (
            <div className="p-4 rounded-lg shadow-lg bg-gray-700 text-center text-gray-400 flex justify-between items-center">
                <span>Popup Preview (Collapsed)</span>
                <button onClick={() => setIsCollapsed(false)} className="text-gray-400 hover:text-white text-xl font-bold">
                    +
                </button>
            </div>
        );
    }

    const fontSizeClass = { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' }[fontSize as 'sm' | 'md' | 'lg' | 'xl' || 'md'];
    const borderRadiusClass = { none: 'rounded-none', sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl', full: 'rounded-full' }[borderRadius as 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' || 'md'];
    const animationClass = { fade: 'animate-fadeIn', slide: 'animate-slideIn', none: '' }[animation as 'fade' | 'slide' | 'none' || 'none'];

    const previewStyle: React.CSSProperties = {
        backgroundColor: backgroundColor || '#374151',
        color: textColor || '#ffffff',
    };
    const buttonStyle: React.CSSProperties = {
        backgroundColor: buttonColor || '#06b6d4',
        color: '#ffffff',
    };

    if (!title && !content) {
        return (
          <div className={`p-4 ${borderRadiusClass} shadow-lg relative`} style={previewStyle}>
            <button onClick={() => setIsCollapsed(true)} className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl font-bold">
                &times;
            </button>
            <p className="text-center text-gray-400">Preview will appear here once you fill in Title and Content.</p>
          </div>
        );
      }

    const ButtonComponent = productUrl ? 'a' : 'button';

    return (
        <div className={`p-4 ${borderRadiusClass} shadow-lg ${animationClass} relative`} style={previewStyle}>
            <button onClick={() => setIsCollapsed(true)} className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl font-bold">
                &times;
            </button>
            {imageUrl && <img src={imageUrl} alt={title} className={`mb-4 max-h-32 w-full object-contain ${borderRadiusClass}`} />}
            <h3 className={`font-bold mb-2 ${fontSizeClass}`}>{title}</h3>
            <p className={`mb-4 ${fontSizeClass}`}>{content}</p>
            {buttonText && (
                <ButtonComponent
                    className={`px-4 py-2 ${borderRadiusClass}`}
                    style={buttonStyle}
                    {...(productUrl ? { href: productUrl, target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                    {buttonText}
                </ButtonComponent>
            )}
        </div>
    );
};


const PopupManager: React.FC = () => {
    const [popups, setPopups] = useState<Popup[]>([]);
    const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'behavior' | 'appearance'>('content');
    const { toast } = useToast();

    const getInitialFormState = (): FormStatePopup => ({
        title: '',
        content: '',
        imageUrl: '',
        isActive: true,
        displayRule: 'always',
        displayTriggers: [{ type: 'onLoad', delaySeconds: 0 }],
        adLocation: 'popup',
        priority: 50,
        targetDevice: 'all',
        schedule: {
            startDate: undefined,
            endDate: undefined,
        },
        appearance: {
            backgroundColor: '#374151',
            textColor: '#ffffff',
            fontSize: 'md',
            borderRadius: 'md',
            animation: 'none',
        },
        callToAction: {
            text: 'Learn More',
            url: '',
            backgroundColor: '#06b6d4',
        },
    });

    const [formState, setFormState] = useState<FormStatePopup>(getInitialFormState());

    useEffect(() => {
        fetchPopups();
    }, []);

    const fetchPopups = async () => {
        try {
            const fetchedPopups = await getPopups();
            setPopups(fetchedPopups);
        } catch (error) {
            toast("Failed to fetch popups.", "error");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormState(prevState => {
            const newState = JSON.parse(JSON.stringify(prevState)); // Deep copy
            const keys = name.split('.');
            
            let current: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }

            const finalKey = keys[keys.length - 1];

            if (type === 'checkbox') {
                current[finalKey] = checked;
            } else if (type === 'date') {
                current[finalKey] = value ? new Date(value).getTime() : undefined;
            } else if (type === 'number') {
                current[finalKey] = Number(value);
            }
            else {
                current[finalKey] = value;
            }

            return newState;
        });
    };

    const handleImageUpload = (url: string) => setFormState({ ...formState, imageUrl: url });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submissionState = {
                ...formState,
                userInteractions: editingPopup ? editingPopup.userInteractions : { views: 0, clicks: 0 }
            }
            if (editingPopup) {
                await updatePopup(editingPopup.id, submissionState);
                toast("Popup updated successfully.", "success");
            } else {
                await createPopup(submissionState);
                toast("Popup created successfully.", "success");
            }
            resetForm();
            fetchPopups();
        } catch (error) {
            toast("Failed to save popup.", "error");
        }
    };

    const handleEdit = (popup: Popup) => {
        setEditingPopup(popup);
        const stateToEdit: FormStatePopup = {
            ...getInitialFormState(),
            ...popup,
            schedule: { ...getInitialFormState().schedule, ...popup.schedule },
            appearance: { ...getInitialFormState().appearance, ...popup.appearance },
            callToAction: { ...getInitialFormState().callToAction, ...popup.callToAction } as { text: string; url: string; backgroundColor?: string; textColor?: string; },
        };
        setFormState(stateToEdit);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this popup?')) {
            try {
                await deletePopup(id);
                setPopups(popups.filter(p => p.id !== id));
                toast("Popup deleted successfully.", "success");
            } catch (error) {
                toast("Failed to delete popup.", "error");
            }
        }
    };

    const resetForm = () => {
        setEditingPopup(null);
        setFormState(getInitialFormState());
    };

    const formatDateForInput = (timestamp?: number) => {
        if (!timestamp) return '';
        return new Date(timestamp).toISOString().split('T')[0];
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'content':
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" value={formState.title} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <Label htmlFor="content">Content</Label>
                            <Textarea id="content" name="content" value={formState.content} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                            <ImageUpload onUploadSuccess={handleImageUpload} currentImageUrl={formState.imageUrl} />
                        </div>
                    </div>
                );
            case 'behavior':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <ToggleSwitch checked={formState.isActive} onChange={(checked) => setFormState({ ...formState, isActive: checked })} />
                            <Label htmlFor="isActive">Is Active</Label>
                        </div>
                        <div>
                            <Label htmlFor="displayRule">Display Rule</Label>
                            <select id="displayRule" name="displayRule" value={formState.displayRule} onChange={handleInputChange} className="w-full">
                                <option value="always">Always</option>
                                <option value="oncePerSession">Once Per Session</option>
                                <option value="oncePerUser">Once Per User</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="adLocation">Ad Location</Label>
                            <select id="adLocation" name="adLocation" value={formState.adLocation} onChange={handleInputChange} className="w-full">
                                <option value="popup">Pop Up</option>
                                <option value="overStorePage">Over Store Page</option>
                                <option value="belowFooter">Below Store Page Footer</option>
                                <option value="miniModule">Mini Pop Up Module</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="startDate">Start Date (Optional)</Label>
                                <Input type="date" id="startDate" name="schedule.startDate" value={formatDateForInput(formState.schedule?.startDate)} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label htmlFor="endDate">End Date (Optional)</Label>
                                <Input type="date" id="endDate" name="schedule.endDate" value={formatDateForInput(formState.schedule?.endDate)} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                );
            case 'appearance':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="backgroundColor">Background Color</Label>
                            <Input type="color" id="backgroundColor" name="appearance.backgroundColor" value={formState.appearance.backgroundColor} onChange={handleInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="textColor">Text Color</Label>
                            <Input type="color" id="textColor" name="appearance.textColor" value={formState.appearance.textColor} onChange={handleInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="fontSize">Font Size</Label>
                            <select id="fontSize" name="appearance.fontSize" value={formState.appearance.fontSize} onChange={handleInputChange} className="w-full">
                                <option value="sm">Small</option>
                                <option value="md">Medium</option>
                                <option value="lg">Large</option>
                                <option value="xl">Extra Large</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="borderRadius">Border Radius</Label>
                            <select id="borderRadius" name="appearance.borderRadius" value={formState.appearance.borderRadius} onChange={handleInputChange} className="w-full">
                                <option value="none">None</option>
                                <option value="sm">Small</option>
                                <option value="md">Medium</option>
                                <option value="lg">Large</option>
                                <option value="xl">Extra Large</option>
                                <option value="full">Full</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="animation">Animation</Label>
                            <select id="animation" name="appearance.animation" value={formState.appearance.animation} onChange={handleInputChange} className="w-full">
                                <option value="none">None</option>
                                <option value="fade">Fade In</option>
                                <option value="slide">Slide In</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="buttonText">Button Text</Label>
                            <Input id="buttonText" name="callToAction.text" value={formState.callToAction?.text} onChange={handleInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="buttonColor">Button Color</Label>
                            <Input type="color" id="buttonColor" name="callToAction.backgroundColor" value={formState.callToAction?.backgroundColor} onChange={handleInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="productUrl">Product URL (Optional)</Label>
                            <Input id="productUrl" name="callToAction.url" value={formState.callToAction?.url} onChange={handleInputChange} placeholder="e.g., /store/product-name" />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6 text-teal-400">Popup Manager</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Left Column: Form and List --- */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-6 bg-gray-800">
                        <h2 className="text-2xl font-semibold mb-4">{editingPopup ? 'Edit Popup' : 'Create New Popup'}</h2>
                        <form onSubmit={handleSubmit}>
                            {/* --- Tab Navigation --- */}
                            <div className="mb-4 border-b border-gray-700">
                                <nav className="-mb-px flex space-x-4">
                                    <button type="button" onClick={() => setActiveTab('content')} className={`${activeTab === 'content' ? 'border-teal-400 text-teal-400' : 'border-transparent text-gray-400'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}>Content</button>
                                    <button type="button" onClick={() => setActiveTab('behavior')} className={`${activeTab === 'behavior' ? 'border-teal-400 text-teal-400' : 'border-transparent text-gray-400'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}>Behavior</button>
                                    <button type="button" onClick={() => setActiveTab('appearance')} className={`${activeTab === 'appearance' ? 'border-teal-400 text-teal-400' : 'border-transparent text-gray-400'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}>Appearance</button>
                                </nav>
                            </div>

                            {/* --- Tab Content --- */}
                            <div className="py-4">
                                {renderTabContent()}
                            </div>

                            {/* --- Form Actions --- */}
                            <div className="flex justify-end space-x-2 mt-6 border-t border-gray-700 pt-4">
                                {editingPopup && <Button type="button" onClick={resetForm} variant="outline">Cancel</Button>}
                                <Button type="submit">{editingPopup ? 'Update Popup' : 'Create Popup'}</Button>
                            </div>
                        </form>
                    </Card>

                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Existing Popups</h2>
                        <div className="space-y-4">
                            {popups.length > 0 ? popups.map((popup) => (
                                <Card key={popup.id} className="p-4 bg-gray-800 flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold">{popup.title}</h3>
                                        <p className="text-gray-400 text-sm mt-1">{popup.content}</p>
                                        <div className="mt-2 text-xs text-gray-500">
                                            <span>Status: <span className={popup.isActive ? 'text-green-400' : 'text-red-400'}>{popup.isActive ? 'Active' : 'Inactive'}</span></span>
                                            <span className="mx-2">|</span>
                                            <span>Rule: {popup.displayRule}</span>
                                            <span className="mx-2">|</span>
                                            <span>Location: {popup.adLocation}</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                        <Button onClick={() => handleEdit(popup)} variant="outline">Edit</Button>
                                        <Button onClick={() => handleDelete(popup.id)} variant="destructive">Delete</Button>
                                    </div>
                                </Card>
                            )) : <p className="text-gray-400">No popups created yet.</p>}
                        </div>
                    </div>
                </div>

                {/* --- Right Column: Preview --- */}
                <div className="lg:col-span-1">
                    <Card className="p-6 bg-gray-800 sticky top-6">
                        <h2 className="text-2xl font-semibold mb-4">Live Preview</h2>
                        <PopupPreview popupState={formState} />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PopupManager;

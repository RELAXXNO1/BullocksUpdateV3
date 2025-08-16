import React, { useState, useEffect } from 'react';
import { Popup } from '../../types/popup';
import { createPopup, getPopups, updatePopup, deletePopup } from '../../lib/popup';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Label } from '../ui/Label';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { Card } from '../ui/Card';
import { useToast } from '../ui/use-toast';
import ImageUpload from '../ui/ImageUpload'; // Assuming you have an ImageUpload component

const PopupManager: React.FC = () => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [formState, setFormState] = useState<Omit<Popup, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    content: '',
    imageUrl: '',
    isActive: true,
    displayRule: 'always',
    adLocation: 'popup', // Default to 'popup'
    startDate: undefined,
    endDate: undefined,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    try {
      const fetchedPopups = await getPopups();
      setPopups(fetchedPopups);
    } catch (error) {
      toast("Failed to fetch popups.", "error");
      console.error("Error fetching popups:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormState({ ...formState, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === 'startDate' || name === 'endDate') {
      setFormState({ ...formState, [name]: value ? new Date(value).getTime() : undefined });
    } else {
      setFormState({ ...formState, [name]: value });
    }
  };

  const handleToggleChange = (checked: boolean) => {
    setFormState({ ...formState, isActive: checked });
  };

  const handleImageUpload = (url: string) => {
    setFormState({ ...formState, imageUrl: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPopup) {
        await updatePopup(editingPopup.id, formState);
        toast("Popup updated successfully.", "success");
      } else {
        await createPopup(formState);
        toast("Popup created successfully.", "success");
      }
      resetForm();
      fetchPopups();
    } catch (error) {
      toast("Failed to save popup.", "error");
      console.error("Error saving popup:", error);
    }
  };

  const handleEdit = (popup: Popup) => {
    setEditingPopup(popup);
    setFormState({
      title: popup.title,
      content: popup.content,
      imageUrl: popup.imageUrl || '',
      isActive: popup.isActive,
      displayRule: popup.displayRule,
      adLocation: popup.adLocation,
      startDate: popup.startDate,
      endDate: popup.endDate,
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this popup?')) {
      try {
        await deletePopup(id);
        setPopups(popups.filter(p => p.id !== id));
        toast("Popup deleted successfully.", "success");
      } catch (error) {
        toast("Failed to delete popup.", "error");
        console.error("Error deleting popup:", error);
      }
    }
  };

  const resetForm = () => {
    setEditingPopup(null);
    setFormState({
    title: '',
    content: '',
    imageUrl: '',
    isActive: true,
    displayRule: 'always',
    adLocation: 'popup', // Reset to default
    startDate: undefined,
    endDate: undefined,
    });
  };

  const formatDateForInput = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-teal-400">Popup Manager</h1>

      <Card className="mb-8 p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-white">{editingPopup ? 'Edit Popup' : 'Create New Popup'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formState.title}
              onChange={handleInputChange}
              placeholder="Enter popup title"
              required
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">Content</Label>
            <Textarea
              id="content"
              name="content"
              value={formState.content}
              onChange={handleInputChange}
              placeholder="Enter popup content"
              required
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-1">Image URL (Optional)</Label>
            <ImageUpload onUploadSuccess={handleImageUpload} currentImageUrl={formState.imageUrl} />
            {formState.imageUrl && (
              <p className="text-sm text-gray-400 mt-2">Current Image: <a href={formState.imageUrl} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">{formState.imageUrl}</a></p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <ToggleSwitch
              checked={formState.isActive}
              onChange={handleToggleChange}
            />
            <Label htmlFor="isActive" className="text-sm font-medium text-gray-300">Is Active</Label>
          </div>
          <div>
            <Label htmlFor="displayRule" className="block text-sm font-medium text-gray-300 mb-1">Display Rule</Label>
            <select
              id="displayRule"
              name="displayRule"
              value={formState.displayRule}
              onChange={handleInputChange}
              className="block w-full p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-white focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="always">Always</option>
              <option value="oncePerSession">Once Per Session</option>
              <option value="oncePerUser">Once Per User</option>
            </select>
          </div>
          <div>
            <Label htmlFor="adLocation" className="block text-sm font-medium text-gray-300 mb-1">Ad Location</Label>
            <select
              id="adLocation"
              name="adLocation"
              value={formState.adLocation}
              onChange={handleInputChange}
              className="block w-full p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-white focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="popup">Pop Up</option>
              <option value="overStorePage">Over Store Page</option>
              <option value="belowFooter">Below Store Page Footer</option>
              <option value="miniModule">Mini Pop Up Module</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">Start Date (Optional)</Label>
              <Input
                type="date"
                id="startDate"
                name="startDate"
                value={formatDateForInput(formState.startDate)}
                onChange={handleInputChange}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">End Date (Optional)</Label>
              <Input
                type="date"
                id="endDate"
                name="endDate"
                value={formatDateForInput(formState.endDate)}
                onChange={handleInputChange}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            {editingPopup && (
              <Button type="button" onClick={resetForm} variant="outline" className="bg-gray-600 hover:bg-gray-700 text-white border-gray-500">
                Cancel Edit
              </Button>
            )}
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
              {editingPopup ? 'Update Popup' : 'Create Popup'}
            </Button>
          </div>
        </form>
      </Card>

      <h2 className="text-2xl font-semibold mb-4 text-white">Existing Popups</h2>
      <div className="space-y-4">
        {popups.length === 0 ? (
          <p className="text-gray-400">No popups created yet.</p>
        ) : (
          popups.map((popup) => (
            <Card key={popup.id} className="p-4 bg-gray-800 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex-1 mb-4 md:mb-0">
                <h3 className="text-xl font-semibold text-white">{popup.title}</h3>
                <p className="text-gray-300 text-sm mt-1">{popup.content}</p>
                {popup.imageUrl && (
                  <img src={popup.imageUrl} alt={popup.title} className="mt-2 max-h-24 object-contain rounded-md" />
                )}
                <div className="mt-2 text-xs text-gray-400">
                  <p>Status: <span className={popup.isActive ? 'text-green-400' : 'text-red-400'}>{popup.isActive ? 'Active' : 'Inactive'}</span></p>
                  <p>Rule: {popup.displayRule}</p>
                  <p>Location: {popup.adLocation}</p>
                  {popup.startDate && <p>Start: {new Date(popup.startDate).toLocaleDateString()}</p>}
                  {popup.endDate && <p>End: {new Date(popup.endDate).toLocaleDateString()}</p>}
                  <p>Created: {new Date(popup.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => handleEdit(popup)} variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500">Edit</Button>
                <Button onClick={() => handleDelete(popup.id)} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PopupManager;

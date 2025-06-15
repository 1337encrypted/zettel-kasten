
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';

const fetchAppSettings = async () => {
    const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
};

type AppSettings = {
    default_readme_title: string;
    default_readme_content: string;
};

const updateAppSettings = async (settings: AppSettings) => {
    const { error } = await supabase.from('app_settings').update(settings).eq('id', 1);
    if (error) throw new Error(error.message);
};

export const AdminSettingsDialog = ({ children }: { children: React.ReactNode }) => {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const { data: settings, isLoading } = useQuery({
        queryKey: ['appSettings'],
        queryFn: fetchAppSettings,
        enabled: isOpen,
    });

    useEffect(() => {
        if (settings) {
            setTitle(settings.default_readme_title);
            setContent(settings.default_readme_content);
        }
    }, [settings]);

    const mutation = useMutation({
        mutationFn: updateAppSettings,
        onSuccess: () => {
            toast.success('Settings updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['appSettings'] });
            setIsOpen(false);
        },
        onError: (error: any) => {
            toast.error(`Failed to update settings: ${error.message}`);
        },
    });

    const handleSave = () => {
        if (title.trim() === '' || content.trim() === '') {
            toast.warning('Title and content cannot be empty.');
            return;
        }
        mutation.mutate({ default_readme_title: title, default_readme_content: content });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Admin Settings</DialogTitle>
                    <DialogDescription>
                        Edit the default README note for new users.
                    </DialogDescription>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="animate-spin" />
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">README Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="content">README Content</Label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="min-h-[200px]"
                                placeholder="Enter default note content here. Supports Markdown."
                            />
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave} disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

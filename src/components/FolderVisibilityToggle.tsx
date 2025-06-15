
import React from 'react';
import { Folder } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe, Lock, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface FolderVisibilityToggleProps {
  folder: Folder;
  onUpdate: (folderData: Pick<Folder, 'id'> & Partial<Pick<Folder, 'isPublic'>>) => void;
  isProfilePublic: boolean;
  isUpdating: boolean;
}

export const FolderVisibilityToggle: React.FC<FolderVisibilityToggleProps> = ({ folder, onUpdate, isProfilePublic, isUpdating }) => {
  const handleToggle = (checked: boolean) => {
    onUpdate({ id: folder.id, isPublic: checked });
  };

  const isDisabled = !isProfilePublic || isUpdating;
  const isEffectivelyPublic = folder.isPublic && isProfilePublic;
  
  const tooltipContent = !isProfilePublic
    ? 'Your profile is private, so you cannot make folders public.'
    : `Set "${folder.name}" folder visibility`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center space-x-2">
          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEffectivelyPublic ? <Globe className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4" />)}
          <Switch
            id={`folder-visibility-${folder.id}`}
            checked={isEffectivelyPublic}
            onCheckedChange={handleToggle}
            disabled={isDisabled}
            aria-label="Toggle folder visibility"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipContent}</p>
      </TooltipContent>
    </Tooltip>
  );
};

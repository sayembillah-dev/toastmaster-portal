import { ReactNode } from 'react';

interface FolderProps {
  color?: string;
  size?: number;
  items?: ReactNode[];
  className?: string;
}

declare const Folder: (props: FolderProps) => JSX.Element;
export default Folder;

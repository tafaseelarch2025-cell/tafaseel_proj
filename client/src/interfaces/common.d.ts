export interface CustomButtonProps {
  type?: string;
  title: string;
  backgroundColor: string;
  color: string;
  fullWidth?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  handleClick?: () => void;
}

export interface ProfileProps {
  userId?:string;
  type: string;
  name: string;
  avatar?: string;
  email: string;
  [key: string]: any; // allow other dynamic fields

 
}



export interface ProjectProps {
  [x: string]: number;
  type?: string;
  _id?: string;
  
  name: string;
  images: {
    projectImages: string[];
  };
  category?: string; // Property type (e.g., Apartment, Villa, etc.)
  
  
 
}



// components/common/common.d.ts  (or interfaces/common.ts)

export interface FormProps {
  type: string;
  register?: any;

  onFinish?: (
    values: FieldValues,
  ) => Promise<void | CreateResponse<BaseRecord> | UpdateResponse<BaseRecord>>;

  formLoading: boolean;
  handleSubmit: FormEventHandler<HTMLFormElement> | undefined;

  handleImageChange: (
    files: FileList | null,
    type: 'projectImages' 
  ) => void;

  onFinishHandler?: (data: FieldValues) => Promise<void> | void;

  projectImages: {
    projectImages: Array<{ name: string; url: string }>;
   // backgroundImage: { name: string; url: string } | null;  // Now optional/null
  };

  handleImageRemove: (
    index: number,
    type: 'projectImages' 
  ) => void;

  control?: Control<FieldValues>;
    isSubmitDisabled: boolean;

}


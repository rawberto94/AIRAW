import React, { useState, useRef } from 'react';

interface FileUploaderProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      console.log("File selected:", e.target.files[0].name);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    if (file) {
      console.log("Starting upload of file:", file.name);
      onUpload(file);
    }
  };

  // Hidden file input - controlled separately from the drag area
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
      <h2 className="text-xl font-medium text-neutral-900 mb-4">Upload Contract</h2>
      
      {/* Hidden file input */}
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx" 
      />

      {!file ? (
        // Step 1: Select file
        <div 
          className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary transition-colors mb-4"
          onClick={handleBrowseClick}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 mx-auto text-neutral-500 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-neutral-600 mb-1">Click to select or drop your contract here</p>
          <p className="text-neutral-500 text-sm mb-4">Supports PDF, DOC, DOCX</p>
          
          <button 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            type="button"
          >
            Browse Files
          </button>
        </div>
      ) : (
        // Step 2: File selected, show upload button
        <div className="bg-neutral-50 border border-neutral-300 rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-primary mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <span className="font-medium">{file.name}</span>
            </div>
            
            <button 
              className="text-neutral-500 hover:text-neutral-700"
              onClick={handleRemoveFile}
              type="button"
              aria-label="Remove file"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
          
          <div className="text-sm text-neutral-600 mb-4">
            <p>File selected successfully. Click the button below to start analysis.</p>
          </div>
          
          <button 
            className={`w-full py-3 rounded-md shadow-sm font-medium flex items-center justify-center
                      ${isLoading 
                        ? 'bg-primary/70 text-white cursor-not-allowed' 
                        : 'bg-primary text-white hover:bg-primary-dark transition-colors'}`}
            onClick={handleUpload}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                  />
                </svg>
                Upload and Analyze
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Instructions */}
      <div className="text-sm text-neutral-500 border-t border-neutral-200 pt-4 mt-2">
        <p className="mb-2">How it works:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Upload your contract document (PDF, DOC, or DOCX)</li>
          <li>Our AI will extract and analyze all clauses</li>
          <li>Review compliance issues and risk assessment</li>
        </ol>
      </div>
    </div>
  );
};

export default FileUploader;

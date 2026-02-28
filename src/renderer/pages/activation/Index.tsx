// src/modules/activation/pages/Index.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ActivationDialog from "../../components/activations/ActivationDialog";

const ActivationPage: React.FC = () => {
  const [showDialog, setShowDialog] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setShowDialog(false);
    // Navigate back to dashboard after closing
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ActivationDialog
        open={showDialog}
        onClose={handleClose}
        forceActivation={true}
      />
    </div>
  );
};

export default ActivationPage;

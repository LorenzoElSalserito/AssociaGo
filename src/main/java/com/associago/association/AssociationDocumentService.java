package com.associago.association;

import com.associago.association.repository.AssociationDocumentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class AssociationDocumentService {

    private final AssociationDocumentRepository documentRepository;
    private final String assetsPath;

    public AssociationDocumentService(AssociationDocumentRepository documentRepository,
                                     @Value("${associago.assets.storage-path}") String assetsPath) {
        this.documentRepository = documentRepository;
        this.assetsPath = assetsPath;
    }

    public List<AssociationDocument> findByAssociationId(Long associationId) {
        return documentRepository.findByAssociationId(associationId);
    }

    public AssociationDocument findById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + id));
    }

    @Transactional
    public AssociationDocument upload(Long associationId, String documentType, String title,
                                     MultipartFile file, Long uploadedBy) throws IOException {
        String dir = assetsPath + "/" + associationId + "/documents";
        Files.createDirectories(Paths.get(dir));

        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + ext;
        Path filePath = Paths.get(dir, filename);
        file.transferTo(filePath.toFile());

        AssociationDocument doc = new AssociationDocument();
        doc.setAssociationId(associationId);
        doc.setDocumentType(documentType);
        doc.setTitle(title);
        doc.setFilePath(filePath.toString());
        doc.setFileSize(file.getSize());
        doc.setMimeType(file.getContentType());
        doc.setUploadedBy(uploadedBy);
        return documentRepository.save(doc);
    }

    @Transactional
    public void delete(Long id) {
        AssociationDocument doc = findById(id);
        try {
            Files.deleteIfExists(Paths.get(doc.getFilePath()));
        } catch (IOException e) {
            // Log but don't fail
        }
        documentRepository.deleteById(id);
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : "";
    }
}

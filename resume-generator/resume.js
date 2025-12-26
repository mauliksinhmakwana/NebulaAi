// Resume Generator for ChatGPT-like interface
class ResumeGenerator {
    constructor() {
        this.resumeData = {
            personalInfo: {
                name: '',
                email: '',
                phone: '',
                location: '',
                website: '',
                linkedin: '',
                github: ''
            },
            education: [],
            experience: [],
            projects: [],
            skills: {
                languages: [],
                frameworks: [],
                tools: [],
                languagesSpoken: []
            },
            certifications: []
        };
        
        this.init();
    }
    
    init() {
        this.createPopup();
        this.setupEventListeners();
        this.loadSavedData();
    }
    
    createPopup() {
        const popupHTML = `
            <div class="resume-popup-overlay" id="resumePopup">
                <div class="resume-popup">
                    <div class="resume-popup-header">
                        <h2><i class="fas fa-file-alt"></i> Resume Generator</h2>
                        <button class="resume-popup-close" id="closeResumePopup">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="resume-popup-content">
                        <form id="resumeForm" class="resume-form">
                            <!-- Personal Information -->
                            <div class="form-section">
                                <h3><i class="fas fa-user"></i> Personal Information</h3>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="fullName">Full Name *</label>
                                        <input type="text" id="fullName" required placeholder="John Doe">
                                    </div>
                                    <div class="form-group">
                                        <label for="email">Email *</label>
                                        <input type="email" id="email" required placeholder="john.doe@email.com">
                                    </div>
                                    <div class="form-group">
                                        <label for="phone">Phone</label>
                                        <input type="tel" id="phone" placeholder="+1 (555) 123-4567">
                                    </div>
                                    <div class="form-group">
                                        <label for="location">Location</label>
                                        <input type="text" id="location" placeholder="San Francisco, CA">
                                    </div>
                                    <div class="form-group">
                                        <label for="website">Website/Portfolio</label>
                                        <input type="url" id="website" placeholder="https://yourwebsite.com">
                                    </div>
                                    <div class="form-group">
                                        <label for="linkedin">LinkedIn</label>
                                        <input type="url" id="linkedin" placeholder="https://linkedin.com/in/username">
                                    </div>
                                    <div class="form-group">
                                        <label for="github">GitHub</label>
                                        <input type="url" id="github" placeholder="https://github.com/username">
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Education -->
                            <div class="form-section">
                                <h3><i class="fas fa-graduation-cap"></i> Education</h3>
                                <div id="educationList" class="dynamic-list">
                                    <!-- Education items will be added here -->
                                </div>
                                <button type="button" class="btn-add" id="addEducation">
                                    <i class="fas fa-plus"></i> Add Education
                                </button>
                            </div>
                            
                            <!-- Experience -->
                            <div class="form-section">
                                <h3><i class="fas fa-briefcase"></i> Experience</h3>
                                <div id="experienceList" class="dynamic-list">
                                    <!-- Experience items will be added here -->
                                </div>
                                <button type="button" class="btn-add" id="addExperience">
                                    <i class="fas fa-plus"></i> Add Experience
                                </button>
                            </div>
                            
                            <!-- Skills -->
                            <div class="form-section">
                                <h3><i class="fas fa-tools"></i> Skills</h3>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="programmingLanguages">Programming Languages</label>
                                        <input type="text" id="programmingLanguages" placeholder="Python, JavaScript, Java, C++">
                                        <small class="form-text">Separate with commas</small>
                                    </div>
                                    <div class="form-group">
                                        <label for="frameworks">Frameworks & Libraries</label>
                                        <input type="text" id="frameworks" placeholder="React, Node.js, TensorFlow, PyTorch">
                                        <small class="form-text">Separate with commas</small>
                                    </div>
                                    <div class="form-group">
                                        <label for="tools">Tools & Technologies</label>
                                        <input type="text" id="tools" placeholder="Git, Docker, AWS, Kubernetes">
                                        <small class="form-text">Separate with commas</small>
                                    </div>
                                    <div class="form-group">
                                        <label for="languages">Languages Spoken</label>
                                        <input type="text" id="languages" placeholder="English, Spanish, French">
                                        <small class="form-text">Separate with commas</small>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Projects -->
                            <div class="form-section">
                                <h3><i class="fas fa-project-diagram"></i> Projects</h3>
                                <div id="projectsList" class="dynamic-list">
                                    <!-- Project items will be added here -->
                                </div>
                                <button type="button" class="btn-add" id="addProject">
                                    <i class="fas fa-plus"></i> Add Project
                                </button>
                            </div>
                            
                            <!-- Certifications -->
                            <div class="form-section">
                                <h3><i class="fas fa-certificate"></i> Certifications</h3>
                                <div id="certificationsList" class="dynamic-list">
                                    <!-- Certification items will be added here -->
                                </div>
                                <button type="button" class="btn-add" id="addCertification">
                                    <i class="fas fa-plus"></i> Add Certification
                                </button>
                            </div>
                        </form>
                        
                        <!-- Loading Spinner -->
                        <div class="loading" id="loadingSpinner">
                            <div class="spinner"></div>
                        </div>
                    </div>
                    
                    <div class="resume-actions">
                        <button type="button" class="btn-secondary" id="saveDraft">Save Draft</button>
                        <button type="button" class="btn-secondary" id="previewResume">Preview</button>
                        <button type="button" class="btn-primary" id="generateResume">Generate PDF</button>
                    </div>
                </div>
            </div>
            
            <!-- Resume Preview Modal -->
            <div class="resume-popup-overlay" id="resumePreviewModal">
                <div class="resume-popup resume-preview-modal">
                    <div class="resume-popup-header">
                        <h2><i class="fas fa-eye"></i> Resume Preview</h2>
                        <button class="resume-popup-close" id="closePreview">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="resume-popup-content resume-preview-content">
                        <iframe id="resumePreview" frameborder="0"></iframe>
                    </div>
                    <div class="resume-actions">
                        <button type="button" class="btn-secondary" id="closePreviewBtn">Close</button>
                        <button type="button" class="btn-primary" id="downloadPdf">Download PDF</button>
                    </div>
                </div>
            </div>
            
            <!-- Toast Notification -->
            <div class="toast" id="toast">
                <div class="toast-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="toast-content">
                    <h4>Success</h4>
                    <p>Your resume has been generated successfully!</p>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', popupHTML);
        this.createDefaultItems();
    }
    
    createDefaultItems() {
        this.addEducationItem();
        this.addExperienceItem();
        this.addProjectItem();
        this.addCertificationItem();
    }
    
    addEducationItem(data = {}) {
        const html = `
            <div class="list-item">
                <div class="list-item-content">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Institution *</label>
                            <input type="text" class="education-institution" value="${data.institution || ''}" placeholder="Princeton University" required>
                        </div>
                        <div class="form-group">
                            <label>Degree *</label>
                            <input type="text" class="education-degree" value="${data.degree || ''}" placeholder="PhD in Computer Science" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Location</label>
                            <input type="text" class="education-location" value="${data.location || ''}" placeholder="Princeton, NJ">
                        </div>
                        <div class="form-group">
                            <label>GPA</label>
                            <input type="text" class="education-gpa" value="${data.gpa || ''}" placeholder="3.97/4.00">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Start Date *</label>
                            <input type="month" class="education-start" value="${data.startDate || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>End Date (or Expected)</label>
                            <input type="month" class="education-end" value="${data.endDate || ''}" placeholder="Present">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Achievements/Details</label>
                        <textarea class="education-details" placeholder="• Thesis: Efficient Neural Architecture Search...&#10;• Advisor: Prof. Sanjeev Arora&#10;• Awards: NSF Graduate Research Fellowship">${data.details || ''}</textarea>
                    </div>
                </div>
                <div class="list-item-actions">
                    <button type="button" class="btn-icon remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        document.getElementById('educationList').insertAdjacentHTML('beforeend', html);
    }
    
    addExperienceItem(data = {}) {
        const html = `
            <div class="list-item">
                <div class="list-item-content">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Company *</label>
                            <input type="text" class="experience-company" value="${data.company || ''}" placeholder="Nexus AI" required>
                        </div>
                        <div class="form-group">
                            <label>Position *</label>
                            <input type="text" class="experience-position" value="${data.position || ''}" placeholder="Co-Founder & CTO" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Location</label>
                            <input type="text" class="experience-location" value="${data.location || ''}" placeholder="San Francisco, CA">
                        </div>
                        <div class="form-group">
                            <label>Employment Type</label>
                            <select class="experience-type dark-select">
                                <option value="full-time" ${data.type === 'full-time' ? 'selected' : ''}>Full-time</option>
                                <option value="part-time" ${data.type === 'part-time' ? 'selected' : ''}>Part-time</option>
                                <option value="internship" ${data.type === 'internship' ? 'selected' : ''}>Internship</option>
                                <option value="contract" ${data.type === 'contract' ? 'selected' : ''}>Contract</option>
                                <option value="freelance" ${data.type === 'freelance' ? 'selected' : ''}>Freelance</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Start Date *</label>
                            <input type="month" class="experience-start" value="${data.startDate || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>End Date</label>
                            <input type="month" class="experience-end" value="${data.endDate || ''}" placeholder="Present">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Responsibilities & Achievements</label>
                        <textarea class="experience-details" placeholder="• Built foundation model infrastructure serving 2M+ monthly API requests&#10;• Raised $18M Series A led by Sequoia Capital&#10;• Scaled engineering team from 3 to 28">${data.details || ''}</textarea>
                        <small class="form-text">Use bullet points (•) for better formatting</small>
                    </div>
                </div>
                <div class="list-item-actions">
                    <button type="button" class="btn-icon remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        document.getElementById('experienceList').insertAdjacentHTML('beforeend', html);
    }
    
    addProjectItem(data = {}) {
        const html = `
            <div class="list-item">
                <div class="list-item-content">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Project Name *</label>
                            <input type="text" class="project-name" value="${data.name || ''}" placeholder="FlashInfer" required>
                        </div>
                        <div class="form-group">
                            <label>Date</label>
                            <input type="month" class="project-date" value="${data.date || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea class="project-description" placeholder="Open-source library for high-performance LLM inference kernels">${data.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Technologies Used</label>
                        <input type="text" class="project-technologies" value="${data.technologies || ''}" placeholder="Python, CUDA, Triton">
                    </div>
                    <div class="form-group">
                        <label>Achievements/Results</label>
                        <textarea class="project-achievements" placeholder="• Achieved 2.8x speedup over baseline&#10;• 8,500+ GitHub stars, 200+ contributors">${data.achievements || ''}</textarea>
                    </div>
                </div>
                <div class="list-item-actions">
                    <button type="button" class="btn-icon remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        document.getElementById('projectsList').insertAdjacentHTML('beforeend', html);
    }
    
    addCertificationItem(data = {}) {
        const html = `
            <div class="list-item">
                <div class="list-item-content">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Certification Name *</label>
                            <input type="text" class="certification-name" value="${data.name || ''}" placeholder="AWS Certified Solutions Architect" required>
                        </div>
                        <div class="form-group">
                            <label>Issuing Organization</label>
                            <input type="text" class="certification-issuer" value="${data.issuer || ''}" placeholder="Amazon Web Services">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Issue Date</label>
                            <input type="month" class="certification-date" value="${data.date || ''}">
                        </div>
                        <div class="form-group">
                            <label>Expiration Date</label>
                            <input type="month" class="certification-expiry" value="${data.expiry || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Credential ID/Link</label>
                        <input type="text" class="certification-id" value="${data.id || ''}" placeholder="Credential ID or URL">
                    </div>
                </div>
                <div class="list-item-actions">
                    <button type="button" class="btn-icon remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        document.getElementById('certificationsList').insertAdjacentHTML('beforeend', html);
    }
    
    setupEventListeners() {
        // Close popup
        document.getElementById('closeResumePopup')?.addEventListener('click', () => this.closePopup());
        document.getElementById('resumePopup')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closePopup();
        });
        
        // Close preview
        document.getElementById('closePreview')?.addEventListener('click', () => this.closePreview());
        document.getElementById('closePreviewBtn')?.addEventListener('click', () => this.closePreview());
        document.getElementById('resumePreviewModal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closePreview();
        });
        
        // Add item buttons
        document.getElementById('addEducation')?.addEventListener('click', () => this.addEducationItem());
        document.getElementById('addExperience')?.addEventListener('click', () => this.addExperienceItem());
        document.getElementById('addProject')?.addEventListener('click', () => this.addProjectItem());
        document.getElementById('addCertification')?.addEventListener('click', () => this.addCertificationItem());
        
        // Remove item buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-item')) {
                e.target.closest('.list-item')?.remove();
            }
        });
        
        // Save draft
        document.getElementById('saveDraft')?.addEventListener('click', () => this.saveDraft());
        
        // Preview resume
        document.getElementById('previewResume')?.addEventListener('click', () => this.previewResume());
        
        // Generate PDF
        document.getElementById('generateResume')?.addEventListener('click', () => this.generatePDF());
        
        // Download PDF from preview
        document.getElementById('downloadPdf')?.addEventListener('click', () => this.downloadPDF());
        
        // Load example data when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                this.loadExampleData();
            }, 1000);
        });
    }
    
    openPopup() {
        document.getElementById('resumePopup').classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closePopup() {
        document.getElementById('resumePopup').classList.remove('active');
        document.body.style.overflow = '';
    }
    
    closePreview() {
        document.getElementById('resumePreviewModal').classList.remove('active');
        document.body.style.overflow = '';
    }
    
    collectFormData() {
        this.resumeData.personalInfo = {
            name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            website: document.getElementById('website').value,
            linkedin: document.getElementById('linkedin').value,
            github: document.getElementById('github').value
        };
        
        this.resumeData.education = [];
        document.querySelectorAll('#educationList .list-item').forEach(item => {
            this.resumeData.education.push({
                institution: item.querySelector('.education-institution').value,
                degree: item.querySelector('.education-degree').value,
                location: item.querySelector('.education-location').value,
                gpa: item.querySelector('.education-gpa').value,
                startDate: item.querySelector('.education-start').value,
                endDate: item.querySelector('.education-end').value,
                details: item.querySelector('.education-details').value
            });
        });
        
        this.resumeData.experience = [];
        document.querySelectorAll('#experienceList .list-item').forEach(item => {
            this.resumeData.experience.push({
                company: item.querySelector('.experience-company').value,
                position: item.querySelector('.experience-position').value,
                location: item.querySelector('.experience-location').value,
                type: item.querySelector('.experience-type').value,
                startDate: item.querySelector('.experience-start').value,
                endDate: item.querySelector('.experience-end').value,
                details: item.querySelector('.experience-details').value
            });
        });
        
        this.resumeData.skills = {
            languages: document.getElementById('programmingLanguages').value.split(',').map(s => s.trim()).filter(s => s),
            frameworks: document.getElementById('frameworks').value.split(',').map(s => s.trim()).filter(s => s),
            tools: document.getElementById('tools').value.split(',').map(s => s.trim()).filter(s => s),
            languagesSpoken: document.getElementById('languages').value.split(',').map(s => s.trim()).filter(s => s)
        };
        
        this.resumeData.projects = [];
        document.querySelectorAll('#projectsList .list-item').forEach(item => {
            this.resumeData.projects.push({
                name: item.querySelector('.project-name').value,
                date: item.querySelector('.project-date').value,
                description: item.querySelector('.project-description').value,
                technologies: item.querySelector('.project-technologies').value,
                achievements: item.querySelector('.project-achievements').value
            });
        });
        
        this.resumeData.certifications = [];
        document.querySelectorAll('#certificationsList .list-item').forEach(item => {
            this.resumeData.certifications.push({
                name: item.querySelector('.certification-name').value,
                issuer: item.querySelector('.certification-issuer').value,
                date: item.querySelector('.certification-date').value,
                expiry: item.querySelector('.certification-expiry').value,
                id: item.querySelector('.certification-id').value
            });
        });
        
        return this.resumeData;
    }
    
    saveDraft() {
        const data = this.collectFormData();
        localStorage.setItem('resumeDraft', JSON.stringify(data));
        this.showToast('Draft saved successfully!', 'success');
    }
    
    loadSavedData() {
        const saved = localStorage.getItem('resumeDraft');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.populateForm(data);
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }
    
    loadExampleData() {
        const exampleData = {
            personalInfo: {
                name: 'John Doe',
                email: 'john.doe@email.com',
                phone: '+1 (555) 123-4567',
                location: 'San Francisco, CA',
                website: 'https://johndoe.dev',
                linkedin: 'https://linkedin.com/in/johndoe',
                github: 'https://github.com/johndoe'
            },
            education: [
                {
                    institution: 'Princeton University',
                    degree: 'PhD in Computer Science',
                    location: 'Princeton, NJ',
                    gpa: '3.97/4.00',
                    startDate: '2018-09',
                    endDate: '2023-05',
                    details: '• Thesis: Efficient Neural Architecture Search for Resource-Constrained Deployment\n• Advisor: Prof. Sanjeev Arora\n• NSF Graduate Research Fellowship, Siebel Scholar (Class of 2022)'
                },
                {
                    institution: 'Boğaziçi University',
                    degree: 'BS in Computer Engineering',
                    location: 'Istanbul, Türkiye',
                    gpa: '3.97/4.00',
                    startDate: '2014-09',
                    endDate: '2018-06',
                    details: '• GPA: 3.97/4.00, Valedictorian\n• Fulbright Scholarship recipient for graduate studies'
                }
            ],
            experience: [
                {
                    company: 'Nexus AI',
                    position: 'Co-Founder & CTO',
                    location: 'San Francisco, CA',
                    type: 'full-time',
                    startDate: '2023-06',
                    endDate: '',
                    details: '• Built foundation model infrastructure serving 2M+ monthly API requests with 99.97% uptime\n• Raised $18M Series A led by Sequoia Capital, with participation from a16z and Founders Fund\n• Scaled engineering team from 3 to 28 across ML research, platform, and applied AI divisions\n• Developed proprietary inference optimization reducing latency by 73% compared to baseline'
                },
                {
                    company: 'NVIDIA Research',
                    position: 'Research Intern',
                    location: 'Santa Clara, CA',
                    type: 'internship',
                    startDate: '2022-05',
                    endDate: '2022-08',
                    details: '• Designed sparse attention mechanism reducing transformer memory footprint by 4.2x\n• Co-authored paper accepted at NeurIPS 2022 (spotlight presentation, top 5% of submissions)'
                }
            ],
            skills: {
                languages: ['Python', 'C++', 'CUDA', 'Rust', 'Julia'],
                frameworks: ['PyTorch', 'JAX', 'TensorFlow', 'Triton', 'ONNX'],
                tools: ['Kubernetes', 'Ray', 'distributed training', 'AWS', 'GCP'],
                languagesSpoken: ['English', 'Turkish']
            },
            projects: [
                {
                    name: 'FlashInfer',
                    date: '2023-01',
                    description: 'Open-source library for high-performance LLM inference kernels',
                    technologies: 'Python, CUDA, Triton',
                    achievements: '• Achieved 2.8x speedup over baseline attention implementations on A100 GPUs\n• Adopted by 3 major AI labs, 8,500+ GitHub stars, 200+ contributors'
                }
            ],
            certifications: [
                {
                    name: 'MIT Technology Review 35 Under 35 Innovators',
                    issuer: 'MIT Technology Review',
                    date: '2024-01',
                    expiry: '',
                    id: ''
                }
            ]
        };
        
        if (!localStorage.getItem('resumeDraft')) {
            this.populateForm(exampleData);
        }
    }
    
    populateForm(data) {
        document.getElementById('fullName').value = data.personalInfo.name || '';
        document.getElementById('email').value = data.personalInfo.email || '';
        document.getElementById('phone').value = data.personalInfo.phone || '';
        document.getElementById('location').value = data.personalInfo.location || '';
        document.getElementById('website').value = data.personalInfo.website || '';
        document.getElementById('linkedin').value = data.personalInfo.linkedin || '';
        document.getElementById('github').value = data.personalInfo.github || '';
        
        document.getElementById('educationList').innerHTML = '';
        document.getElementById('experienceList').innerHTML = '';
        document.getElementById('projectsList').innerHTML = '';
        document.getElementById('certificationsList').innerHTML = '';
        
        data.education?.forEach(edu => this.addEducationItem(edu));
        data.experience?.forEach(exp => this.addExperienceItem(exp));
        
        document.getElementById('programmingLanguages').value = data.skills?.languages?.join(', ') || '';
        document.getElementById('frameworks').value = data.skills?.frameworks?.join(', ') || '';
        document.getElementById('tools').value = data.skills?.tools?.join(', ') || '';
        document.getElementById('languages').value = data.skills?.languagesSpoken?.join(', ') || '';
        
        data.projects?.forEach(proj => this.addProjectItem(proj));
        data.certifications?.forEach(cert => this.addCertificationItem(cert));
    }
    
    previewResume() {
        this.collectFormData();
        const resumeHTML = this.generateResumeHTML();
        
        const blob = new Blob([resumeHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        document.getElementById('resumePreview').src = url;
        document.getElementById('resumePreviewModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    generateResumeHTML() {
        const data = this.resumeData;
        
        const formatDate = (dateStr) => {
            if (!dateStr) return 'Present';
            const date = new Date(dateStr + '-01');
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        };
        
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${data.personalInfo.name} - Resume</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Calibri', 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: white; padding: 40px; max-width: 1000px; margin: 0 auto; }
        .resume { background: white; padding: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #2c3e50; padding-bottom: 20px; }
        .name { font-size: 36px; font-weight: bold; color: #2c3e50; margin-bottom: 10px; }
        .contact-info { display: flex; justify-content: center; flex-wrap: wrap; gap: 20px; margin-bottom: 10px; font-size: 14px; color: #555; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 20px; font-weight: bold; color: #2c3e50; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #eee; text-transform: uppercase; }
        .item-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .item-title { font-size: 16px; font-weight: bold; color: #333; }
        .item-subtitle { font-size: 14px; color: #666; margin-bottom: 5px; }
        .item-date { font-size: 14px; color: #2c3e50; font-weight: 500; }
        .item-details { font-size: 14px; color: #555; margin-top: 5px; white-space: pre-line; }
        .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .skill-category h4 { font-size: 14px; color: #2c3e50; margin-bottom: 5px; font-weight: 600; }
        .skill-list { font-size: 14px; color: #555; }
        ul { padding-left: 20px; }
        li { margin-bottom: 3px; }
        @media (max-width: 768px) {
            body { padding: 20px; }
            .resume { padding: 20px; }
            .name { font-size: 28px; }
            .contact-info { flex-direction: column; align-items: center; gap: 10px; }
            .skills-grid { grid-template-columns: 1fr; }
            .item-header { flex-direction: column; }
            .item-date { margin-top: 5px; }
        }
    </style>
</head>
<body>
    <div class="resume">
        <div class="header">
            <h1 class="name">${data.personalInfo.name}</h1>
            <div class="contact-info">
                ${data.personalInfo.email ? `<div>📧 ${data.personalInfo.email}</div>` : ''}
                ${data.personalInfo.phone ? `<div>📱 ${data.personalInfo.phone}</div>` : ''}
                ${data.personalInfo.location ? `<div>📍 ${data.personalInfo.location}</div>` : ''}
                ${data.personalInfo.website ? `<div>🌐 ${data.personalInfo.website}</div>` : ''}
                ${data.personalInfo.linkedin ? `<div>💼 ${data.personalInfo.linkedin}</div>` : ''}
                ${data.personalInfo.github ? `<div>💻 ${data.personalInfo.github}</div>` : ''}
            </div>
        </div>
        
        ${data.education.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Education</h2>
            ${data.education.map(edu => `
                <div class="education-item">
                    <div class="item-header">
                        <div class="item-title">${edu.degree}</div>
                        <div class="item-date">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</div>
                    </div>
                    <div class="item-subtitle">${edu.institution}${edu.location ? `, ${edu.location}` : ''}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
                    ${edu.details ? `<div class="item-details">${edu.details.replace(/\n/g, '<br>')}</div>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${data.experience.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Experience</h2>
            ${data.experience.map(exp => `
                <div class="experience-item">
                    <div class="item-header">
                        <div class="item-title">${exp.position}</div>
                        <div class="item-date">${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}</div>
                    </div>
                    <div class="item-subtitle">${exp.company}${exp.location ? `, ${exp.location}` : ''} | ${exp.type.charAt(0).toUpperCase() + exp.type.slice(1)}</div>
                    ${exp.details ? `<div class="item-details">${exp.details.replace(/\n/g, '<br>')}</div>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${Object.values(data.skills).flat().length > 0 ? `
        <div class="section">
            <h2 class="section-title">Skills</h2>
            <div class="skills-grid">
                ${data.skills.languages.length > 0 ? `
                <div class="skill-category">
                    <h4>Programming Languages</h4>
                    <div class="skill-list">${data.skills.languages.join(', ')}</div>
                </div>
                ` : ''}
                
                ${data.skills.frameworks.length > 0 ? `
                <div class="skill-category">
                    <h4>Frameworks & Libraries</h4>
                    <div class="skill-list">${data.skills.frameworks.join(', ')}</div>
                </div>
                ` : ''}
                
                ${data.skills.tools.length > 0 ? `
                <div class="skill-category">
                    <h4>Tools & Technologies</h4>
                    <div class="skill-list">${data.skills.tools.join(', ')}</div>
                </div>
                ` : ''}
                
                ${data.skills.languagesSpoken.length > 0 ? `
                <div class="skill-category">
                    <h4>Languages</h4>
                    <div class="skill-list">${data.skills.languagesSpoken.join(', ')}</div>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
        
        ${data.projects.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Projects</h2>
            ${data.projects.map(proj => `
                <div class="project-item">
                    <div class="item-header">
                        <div class="item-title">${proj.name}</div>
                        ${proj.date ? `<div class="item-date">${formatDate(proj.date)}</div>` : ''}
                    </div>
                    ${proj.description ? `<div class="item-subtitle">${proj.description}</div>` : ''}
                    ${proj.technologies ? `<div class="item-subtitle"><strong>Technologies:</strong> ${proj.technologies}</div>` : ''}
                    ${proj.achievements ? `<div class="item-details">${proj.achievements.replace(/\n/g, '<br>')}</div>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${data.certifications.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Certifications</h2>
            ${data.certifications.map(cert => `
                <div class="certification-item">
                    <div class="certification-name">${cert.name}</div>
                    <div class="certification-details">
                        ${cert.issuer ? `${cert.issuer} • ` : ''}
                        ${cert.date ? `Issued ${formatDate(cert.date)}` : ''}
                        ${cert.expiry ? ` • Expires ${formatDate(cert.expiry)}` : ''}
                        ${cert.id ? ` • ID: ${cert.id}` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            Generated with Resume Generator • ${new Date().toLocaleDateString()}
        </div>
    </div>
</body>
</html>`;
    }
    
    async generatePDF() {
        this.showLoading(true);
        
        try {
            const data = this.collectFormData();
            
            if (!data.personalInfo.name || !data.personalInfo.email) {
                this.showToast('Please fill in required fields (Name and Email)', 'error');
                this.showLoading(false);
                return;
            }
            
            const resumeHTML = this.generateResumeHTML();
            
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(resumeHTML);
            iframeDoc.close();
            
            await new Promise(resolve => {
                iframe.onload = resolve;
                iframeDoc.addEventListener('load', resolve);
            });
            
            setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                
                this.showLoading(false);
                this.showToast('PDF generated successfully! Check your print dialog.', 'success');
                this.closePopup();
                
                setTimeout(() => document.body.removeChild(iframe), 1000);
            }, 1000);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showToast('Error generating PDF. Please try again.', 'error');
            this.showLoading(false);
        }
    }
    
    downloadPDF() {
        const iframe = document.getElementById('resumePreview');
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    }
    
    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (show) {
            spinner.classList.add('active');
        } else {
            spinner.classList.remove('active');
        }
    }
    
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const icon = toast.querySelector('.toast-icon i');
        const title = toast.querySelector('.toast-content h4');
        const text = toast.querySelector('.toast-content p');
        
        title.textContent = type === 'success' ? 'Success' : 'Error';
        text.textContent = message;
        
        if (type === 'success') {
            icon.className = 'fas fa-check-circle';
            toast.className = 'toast success';
        } else {
            icon.className = 'fas fa-exclamation-circle';
            toast.className = 'toast error';
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.resumeGenerator = new ResumeGenerator();
    
    // Add menu item click handler - FOR YOUR MENU STRUCTURE
    const resumeMenuItem = document.createElement('div');
    resumeMenuItem.className = 'menu-item';
    resumeMenuItem.id = 'resumeMenuItem';
    resumeMenuItem.innerHTML = `
        <i class="fas fa-file-alt"></i>
        <span>Resume Generator</span>
    `;
    
    // Find your menu and append the item
    const menu = document.querySelector('.menu-items') || document.querySelector('.sidebar nav') || document.querySelector('nav');
    if (menu) {
        menu.appendChild(resumeMenuItem);
        
        // Add click event
        resumeMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            window.resumeGenerator.openPopup();
        });
    }
});

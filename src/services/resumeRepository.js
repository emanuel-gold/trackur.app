import resumeAdapter from './resumeAdapter.js';

const adapter = resumeAdapter;

const resumeRepository = {
  getAll: () => adapter.getAll(),
  insert: (resume, file) => adapter.insert(resume, file),
  updateLabel: (id, label) => adapter.updateLabel(id, label),
  remove: (id) => adapter.remove(id),
  getDownloadUrl: (resumeOrPath) => adapter.getDownloadUrl(resumeOrPath),
  linkDriveFile: (metadata) => adapter.linkDriveFile(metadata),
};

export default resumeRepository;

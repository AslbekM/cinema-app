import { useState, useEffect } from 'react'
import { getProfile, updateProfile, type ProfileData } from '../api/profile'
import { useAuth } from '../contexts/AuthContext'
import PasswordInput from '../components/PasswordInput'

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nickname: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { refreshUser } = useAuth()

  useEffect(() => {
    getProfile().then((p) => {
      setProfile(p)
      setForm((f) => ({
        ...f,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        nickname: p.nickname,
        phoneNumber: p.phoneNumber ?? '',
      }))
    })
  }, [])

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setSuccess(false)

    if (form.newPassword && form.newPassword !== form.confirmNewPassword) {
      setErrors(['New passwords do not match.'])
      return
    }

    setLoading(true)
    try {
      const updated = await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        nickname: form.nickname,
        phoneNumber: form.phoneNumber || undefined,
        rowVersion: profile?.rowVersion,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined,
      })
      setProfile(updated)
      setForm((f) => ({
        ...f,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        nickname: updated.nickname,
        phoneNumber: updated.phoneNumber ?? '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }))
      await refreshUser()
      setSuccess(true)
    } catch (err) {
      setErrors(Array.isArray(err) ? err : ['Failed to update profile.'])
      // Reload profile to get fresh rowVersion after concurrency error
      getProfile().then((p) => {
        setProfile(p)
        setForm((f) => ({ ...f, rowVersion: p.rowVersion } as typeof f))
      })
    } finally {
      setLoading(false)
    }
  }

  if (!profile)
    return (
      <div className="loader">
        <div className="loader-ring" />
        <span>Loading profile…</span>
      </div>
    )

  return (
    <div className="row justify-content-center">
      <div className="col-md-7">
        <div className="section-head">
          <div>
            <h2>My Profile</h2>
            <div className="section-sub">Manage your account details</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">

        {success && (
          <div className="alert alert-success alert-dismissible" role="alert">
            Profile updated successfully.
            <button type="button" className="btn-close" onClick={() => setSuccess(false)} />
          </div>
        )}
        {errors.map((e, i) => (
          <div key={i} className="alert alert-danger py-2">
            {e}
          </div>
        ))}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col mb-3">
              <label className="form-label">First Name</label>
              <input className="form-control" value={form.firstName} onChange={set('firstName')} required maxLength={50} />
            </div>
            <div className="col mb-3">
              <label className="form-label">Last Name</label>
              <input className="form-control" value={form.lastName} onChange={set('lastName')} required maxLength={50} />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={form.email} onChange={set('email')} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Nickname</label>
            <input className="form-control" value={form.nickname} onChange={set('nickname')} required maxLength={30} />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone Number <span className="text-muted">(optional)</span></label>
            <input type="tel" className="form-control" value={form.phoneNumber} onChange={set('phoneNumber')} />
          </div>

          <hr />
          <h5 className="mb-3">Change Password <span className="text-muted fw-normal fs-6">(leave blank to keep current)</span></h5>
          <PasswordInput label="Current Password" value={form.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" />
          <PasswordInput label="New Password" value={form.newPassword} onChange={set('newPassword')} autoComplete="new-password" minLength={6} />
          <PasswordInput label="Confirm New Password" value={form.confirmNewPassword} onChange={set('confirmNewPassword')} autoComplete="new-password" />

          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
          </div>
        </div>
      </div>
    </div>
  )
}

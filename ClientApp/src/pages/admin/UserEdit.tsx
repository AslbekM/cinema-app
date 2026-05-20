import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getUser, updateUser, changeUserPassword, type UserInfo } from '../../api/users'
import PasswordInput from '../../components/PasswordInput'

export default function UserEdit() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nickname: '',
    phoneNumber: '',
    rowVersion: undefined as string | undefined,
  })
  const [pwForm, setPwForm] = useState({ newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState<string[]>([])
  const [pwErrors, setPwErrors] = useState<string[]>([])
  const [pwSuccess, setPwSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const stateUser = (location.state as { user?: UserInfo } | null)?.user
    if (stateUser && stateUser.id === id) {
      setForm({
        firstName: stateUser.firstName,
        lastName: stateUser.lastName,
        email: stateUser.email,
        nickname: stateUser.nickname,
        phoneNumber: stateUser.phoneNumber ?? '',
        rowVersion: stateUser.rowVersion,
      })
      setFetching(false)
      return
    }
    if (id) {
      getUser(id)
        .then((u) =>
          setForm({
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            nickname: u.nickname,
            phoneNumber: u.phoneNumber ?? '',
            rowVersion: u.rowVersion,
          })
        )
        .catch(() => setErrors(['Failed to load user.']))
        .finally(() => setFetching(false))
    }
  }, [id, location.state])

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setLoading(true)
    try {
      await updateUser(id!, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        nickname: form.nickname,
        phoneNumber: form.phoneNumber || undefined,
        rowVersion: form.rowVersion,
      })
      navigate('/admin/users')
    } catch (err) {
      setErrors(Array.isArray(err) ? err : ['Failed to update user.'])
      if (id) {
        getUser(id).then((u) =>
          setForm((f) => ({ ...f, rowVersion: u.rowVersion, firstName: u.firstName, lastName: u.lastName, email: u.email, nickname: u.nickname, phoneNumber: u.phoneNumber ?? '' }))
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwErrors([])
    setPwSuccess(false)
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwErrors(['Passwords do not match.'])
      return
    }
    setPwLoading(true)
    try {
      await changeUserPassword(id!, pwForm.newPassword)
      setPwForm({ newPassword: '', confirmPassword: '' })
      setPwSuccess(true)
    } catch (err) {
      setPwErrors(Array.isArray(err) ? err : ['Failed to change password.'])
    } finally {
      setPwLoading(false)
    }
  }

  if (fetching)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
      </div>
    )

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h2 className="mb-4">Edit User</h2>

        {errors.map((e, i) => (
          <div key={i} className="alert alert-danger py-2">{e}</div>
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
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-warning" disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/admin/users')}>
              Cancel
            </button>
          </div>
        </form>

        <hr className="my-4" />
        <h5 className="mb-3">Change Password</h5>

        {pwSuccess && (
          <div className="alert alert-success alert-dismissible py-2">
            Password changed successfully.
            <button type="button" className="btn-close" onClick={() => setPwSuccess(false)} />
          </div>
        )}
        {pwErrors.map((e, i) => (
          <div key={i} className="alert alert-danger py-2">{e}</div>
        ))}

        <form onSubmit={handlePasswordSubmit}>
          <PasswordInput
            label="New Password"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <PasswordInput
            label="Confirm New Password"
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            required
            autoComplete="new-password"
          />
          <button type="submit" className="btn btn-warning" disabled={pwLoading}>
            {pwLoading ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

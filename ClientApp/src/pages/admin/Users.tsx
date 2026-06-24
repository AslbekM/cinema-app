import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUsers, deleteUser, type UserInfo } from '../../api/users'

export default function Users() {
  const [users, setUsers] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    getUsers()
      .then(setUsers)
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (user: UserInfo) => {
    if (!confirm(`Delete user "${user.nickname}"? This cannot be undone.`)) return
    setDeleting(user.id)
    try {
      await deleteUser(user.id, user.rowVersion)
      setMsg({ type: 'success', text: `User "${user.nickname}" deleted.` })
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
    } catch (err) {
      setMsg({
        type: 'danger',
        text: Array.isArray(err) ? err.join(' ') : 'Failed to delete user.',
      })
      load() // Reload to get fresh rowVersions
    } finally {
      setDeleting(null)
    }
  }

  if (loading)
    return (
      <div className="loader">
        <div className="loader-ring" />
        <span>Loading users…</span>
      </div>
    )

  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Users</h2>
          <div className="section-sub">{users.length} registered</div>
        </div>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type} alert-dismissible py-2`} role="alert">
          {msg.text}
          <button type="button" className="btn-close" onClick={() => setMsg(null)} />
        </div>
      )}

      <div className="alert alert-info py-2">
        🔒 Passwords are stored as one-way salted hashes and are never displayed. To change a
        user's password, use <strong>Edit</strong> to set a new one.
      </div>

      <div className="table-wrap">
      <table className="table table-hover mb-0">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Nickname</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                {u.firstName} {u.lastName}
              </td>
              <td>{u.email}</td>
              <td>{u.nickname}</td>
              <td>{u.phoneNumber ?? '—'}</td>
              <td>
                <Link
                  className="btn btn-warning btn-sm me-2"
                  to={`/admin/users/${u.id}/edit`}
                  state={{ user: u }}
                >
                  Edit
                </Link>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(u)}
                  disabled={deleting === u.id || u.nickname === 'admin'}
                  title={u.nickname === 'admin' ? 'Cannot delete main admin' : undefined}
                >
                  {deleting === u.id ? '…' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}

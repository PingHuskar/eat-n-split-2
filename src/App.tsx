import { useState } from 'react'
import './App.css'

interface tFriend {
  id: string,
  name: string,
  aka: string,
  balance: number,
}

function App() {
  const [friends, setFriends] = useState<tFriend[]>(JSON.parse(localStorage.getItem(`friends`) || `[]`))
  const [showAddFriend, setShowAddFriend] = useState<boolean>(false)
  const [selectedFriend, setSelectedFriend] = useState<any>(null)

  function handleShowAddFriend() {
    setShowAddFriend((show) => !show)
  }

  function handleAddFriend(friend: any) {
    localStorage.setItem(`friends`, JSON.stringify([...friends, friend]))
    // setFriends(friends => [...friends, friend])
    setFriends(JSON.parse(localStorage.getItem(`friends`)!))
    setShowAddFriend(false)
  }

  function handleSelection(friend: tFriend) {
    // setSelectedFriend(friend)
    setSelectedFriend((cur: tFriend) => (cur?.id === friend.id) ? null : friend)
    setShowAddFriend(false)
  }

  function handleSplitBill(value: number) {
    // console.log(value)

    
    localStorage.setItem(`friends`, JSON.stringify(
      friends?.map(friend => friend.id === selectedFriend!.id
        ? {...friend,balance: friend.balance + value} 
        : friend
      )
      )
    )
    setFriends(JSON.parse(localStorage.getItem(`friends`)!))
    setSelectedFriend(null)
  }

  function handleClearFriends() {
    if (confirm(`You Want To Clear All Friends? This Action Can't be Undone!`)) {
      localStorage.setItem(`friends`, `[]`)
      setFriends(JSON.parse(localStorage.getItem(`friends`)!))
    }
  }

  return (
    <>
      <div className="app">
        <div className="sidebar">
          <FriendList 
              friends={friends} 
              selectedFriend={selectedFriend}
              onSelection={handleSelection}
          />
          {showAddFriend &&
            <FormAddFriend onAddFriend={handleAddFriend} />
          }
          <Button onClick={handleShowAddFriend}>
            {showAddFriend ? `Close Add a new friend box` : `Add a new friend` 
            }
          </Button>
          {friends!.length > 0 && 
            <Button onClick={handleClearFriends}>
              Clear Friends
            </Button>
          }
        </div>
        {selectedFriend 
        && <FormSplitBill selectedFriend={selectedFriend} 
          onSplitBill={handleSplitBill}
          key={selectedFriend.name}
        />}
      </div>
    </>
  )
}

function FriendList({friends, onSelection, selectedFriend}: {friends: any, onSelection: any,selectedFriend: any}) {
  return <ul>
    {friends.map((friend: any) => {
      return <Friend friend={friend} key={friend.id} onSelection={onSelection} selectedFriend={selectedFriend} />
    })}
  </ul>
}

function Friend({friend, onSelection, selectedFriend}: {friend: any, onSelection: any, selectedFriend: any}) {
  const isSelected = selectedFriend?.id === friend.id
  return <li className={isSelected ? `selected` : ``}>
    <img src={`https://unavatar.io/github/${friend.aka}`} alt={friend.name} />
    <h3>{friend.name}</h3>
    {friend.balance < 0 && <p className={`red`}>You owe 
    {/* {friend.name} */} {-friend.balance}฿</p>}
    {friend.balance > 0 && <p className={`green`}>
      {/* {friend.name}  */}
      owes you {friend.balance}฿
      </p>}
    {friend.balance === 0 && <p>You and {friend.name} are even</p>}
    <Button onClick={() => onSelection(friend)}>
      {isSelected ? `\u00D7 Close` : `Select`}
    </Button>
  </li>
}

function Button({children, onClick}: {children: any, onClick: any|null}) {
  return <button className={`button`} onClick={onClick}>{children}</button>
}

function FormAddFriend({onAddFriend}: {onAddFriend: any}) {
  const [name, setName] = useState(``)
  const [aka, setAKA] = useState(``)

  function handleSubmit(e:any) {
    e.preventDefault();

    if (!name || !aka) return

    const id = crypto.randomUUID()
    const newFriend = {
      name,
      aka,
      balance: 0,
      id,
    }

    onAddFriend(newFriend)
    setName(``)
    setAKA(``)
  }

  return <form className='form-add-friend' onSubmit={handleSubmit}>
    <label htmlFor="friendname">😺 Name</label>
    <input type="text" name="friendname" id="friendname" value={name} 
    onChange={(e) => setName(e.currentTarget.value) } />

    <label htmlFor="friendaka">🧑‍💻 Github</label>
    <input type="text" name="friendaka" id="friendaka" value={aka} 
    onChange={(e) => setAKA(e.currentTarget.value) } />
    <div className="">
      <img src={`https://unavatar.io/github/${aka}`} width={50} alt="" />
    </div>
    {(name && aka) && 
      <Button onClick={() => {}}>Add</Button>
    }
  </form>
}

function FormSplitBill({selectedFriend, onSplitBill}: {selectedFriend: any, onSplitBill: any}) {
  const [bill, setBill] = useState(0)
  const [paidByUser, setPaidByUser] = useState(0)
  const paidByFriend = bill - paidByUser
  const [whoIsPaying, setWhoIsPaying] = useState(`user`)

  function handleSubmit(e: any) {
    e.preventDefault()
    if (!bill && !paidByUser) return

    onSplitBill(whoIsPaying === `user` ? paidByFriend : -paidByUser)
  }

  return <form className={`form-split-bill`} onSubmit={handleSubmit}>
    <h2>Split bill with {selectedFriend.name}</h2>

    <label htmlFor="billvalue">💵 Bill value</label>
    <input type="number" name="billvalue" id="billvalue" value={bill}
    onChange={(e) => {
      setBill(Number(e.target.value.replace(/[^0-9]/g,``)))
      setPaidByUser(Math.round(Number(e.target.value.replace(/[^0-9]/g,``))/2))
    }} />

    <label htmlFor="yourexpense">💵 Your expense</label>
    <input type="number" name="yourexpense" id="yourexpense" value={paidByUser}
    onChange={(e) => setPaidByUser(Number(e.target.value.replace(/[^0-9]/g,``)) > bill ? paidByUser : Number(e.target.value.replace(/[^0-9]/g,``)))} />

    <label htmlFor="friendexpense">💵 {selectedFriend.name}'s expense</label>
    <input type="number" name="friendexpense" id="friendexpense" 
    value={paidByFriend}
    disabled />

    <label htmlFor="whopaythebill">🤑 Who is paying the bill</label>
    <select name="whopaythebill" id="whopaythebill" value={whoIsPaying}
    onChange={(e) => setWhoIsPaying(e.target.value)}>
      <option value="user">Me</option>
      <option value="friend">{selectedFriend.name}</option>
    </select>
    {paidByUser !== paidByFriend &&
      <Button onClick={() => {}}>Split bill</Button>
    }
  </form>
}

export default App

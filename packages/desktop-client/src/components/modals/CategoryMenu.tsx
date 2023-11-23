import React, { useEffect, useState } from 'react';

import { useLiveQuery } from 'loot-core/src/client/query-hooks';
import q from 'loot-core/src/shared/query';
import { type CategoryEntity } from 'loot-core/src/types/models';

import Trash from '../../icons/v1/Trash';
import ViewHide from '../../icons/v2/ViewHide';
import ViewShow from '../../icons/v2/ViewShow';
import { useResponsive } from '../../ResponsiveProvider';
import { styles } from '../../style';
import { type CommonModalProps } from '../../types/modals';
import Button from '../common/Button';
import Modal from '../common/Modal';
import View from '../common/View';
import Notes from '../Notes';

type CategoryMenuProps = {
  modalProps: CommonModalProps;
  category: CategoryEntity;
  onSave: (category: CategoryEntity) => void;
  onToggleVisibility: (isHidden: boolean) => void;
  onSaveNotes: (id: string, notes: string) => void;
  onDelete: (categoryId: string) => void;
  onBudgetAction: (idx: number, action: string, arg: unknown) => void;
};

export default function CategoryMenu({
  modalProps,
  category,
  onSave,
  onToggleVisibility,
  onSaveNotes,
  onDelete,
  onBudgetAction,
}: CategoryMenuProps) {
  const { isNarrowWidth } = useResponsive();
  const { id, hidden } = category;
  const data = useLiveQuery(() => q('notes').filter({ id }).select('*'), [id]);
  const originalNotes = data && data.length > 0 ? data[0].note : null;

  const [name, setName] = useState(category.name);
  const [notes, setNotes] = useState(originalNotes);
  useEffect(() => setNotes(originalNotes), [originalNotes]);

  function _onClose() {
    if (notes !== originalNotes) {
      onSaveNotes?.(id, notes);
    }

    if (name !== category.name) {
      onSave?.({
        ...category,
        name,
      });
    }

    modalProps?.onClose();
  }

  function _onSaveNotes(value) {
    setNotes(value);
  }

  function _onToggleVisibility() {
    onToggleVisibility?.(!!hidden);
    _onClose();
  }

  function _onDelete() {
    onDelete?.(id);
    _onClose();
  }

  function onNameChange(newName) {
    setName(newName);
  }

  const menuItemStyle = {
    fontSize: 17,
    fontWeight: 400,
    paddingTop: 8,
    paddingBottom: 8,
    marginTop: 8,
  };

  return (
    <Modal
      title={name}
      showHeader={true}
      focusAfterClose={false}
      {...modalProps}
      onClose={_onClose}
      padding={0}
      style={{
        flex: 0,
        height: isNarrowWidth ? '85vh' : 275,
        padding: '15px 10px',
        borderRadius: '6px',
      }}
      editableTitle={true}
      titleStyle={{
        ...styles.underlinedText,
      }}
      onTitleChange={onNameChange}
    >
      {() => (
        <View>
          <View>
            <Notes
              notes={originalNotes}
              editable={true}
              onBlur={_onSaveNotes}
              getStyle={editable => ({
                borderRadius: 6,
              })}
            />
          </View>
          <View
            style={{
              flexDirection: 'column',
              flex: 1,
              width: '100%',
            }}
          >
            <Button
              type="primary"
              style={menuItemStyle}
              onPointerUp={_onToggleVisibility}
            >
              {category.hidden ? (
                <ViewShow width={20} height={20} style={{ paddingRight: 5 }} />
              ) : (
                <ViewHide width={20} height={20} style={{ paddingRight: 5 }} />
              )}
              {category.hidden ? 'Unhide' : 'Hide'}
            </Button>
            <Button
              type="primary"
              style={menuItemStyle}
              onPointerUp={_onDelete}
            >
              <Trash width={17} height={17} style={{ paddingRight: 5 }} />
              Delete
            </Button>
          </View>
        </View>
      )}
    </Modal>
  );
}
